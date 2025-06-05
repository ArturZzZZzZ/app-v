import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { useGetNavProviderAccounts } from "@/api/solana/helpers";
import { AnchorProvider, BN, Program } from "@coral-xyz/anchor";
import {
  TOKEN_2022_PROGRAM_ID,
  createAssociatedTokenAccountInstruction,
  getAccount,
  getAssociatedTokenAddress,
  getExtraAccountMetaAddress,
  getExtraAccountMetas,
  getMint,
  getTransferHook,
  resolveExtraAccountMeta,
  unpackMint
} from "@solana/spl-token";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import {
  AccountMeta,
  ComputeBudgetProgram,
  ConfirmOptions,
  Connection,
  PublicKey,
  Transaction
} from "@solana/web3.js";

import idl from "../api/solana/idls/sc_vault.json";
import idlDevnet from "../api/solana/idls/sc_vault_devnet.json";
import { useAppContext } from "./AppContext";
import { TokenBalance, VaultConfig, WithTransferHookArgs } from "./type";

export function makeProvider(connection: Connection, wallet, isDevnet) {
  const opts = isDevnet
    ? AnchorProvider.defaultOptions()
    : ({
        commitment: "finalized",
        preflightCommitment: "finalized"
      } as ConfirmOptions);

  const provider = new AnchorProvider(connection, wallet, opts);
  return provider;
}

export function makeVaultProgram(provider, isDevnet) {
  return new Program(isDevnet ? idlDevnet : idl, provider);
}

export const getVaultStatePda = (programIdPk, vaultId) => {
  const VAULT_STATE_SEED = "vault_state";

  const idBuffer = new BN(vaultId).toArrayLike(Buffer, "le", 8);

  const [vaultStatePubkey] = PublicKey.findProgramAddressSync(
    [Buffer.from(VAULT_STATE_SEED), idBuffer],
    programIdPk
  );

  return vaultStatePubkey;
};

export function vaultAuthorityAddress(programIdPk, vaultId) {
  const [vaultAuthority] = PublicKey.findProgramAddressSync(
    [
      Buffer.from("vault_authority"),
      getVaultStatePda(programIdPk, vaultId).toBuffer()
    ],
    programIdPk
  );

  return vaultAuthority;
}

export function toBaseUnits(amountStr, decimals) {
  const [whole, frac = ""] = amountStr.split(".");
  const fracPadded = (frac + "0".repeat(decimals)).slice(0, decimals);
  const wholeBn = new BN(whole).mul(new BN(10).pow(new BN(decimals)));
  const fracBn = new BN(fracPadded);
  return wholeBn.add(fracBn);
}

export const getAllVaultState = async (program) => {
  const vaults = await program.account.vaultState.all();
  const vaultsWithState = vaults.map((vault) => {
    const vaultState = vault.account;
    return [vault.publicKey, vaultState];
  });

  vaultsWithState.forEach((vault) => {
    console.log(`- ${vault[0].toBase58()}`);
    console.log(`  Vault State: ${JSON.stringify(vault[1], null, 2)}`);
  });
};

export const getVaultStateById = async (program, vaultId) => {
  const vaultPda = getVaultStatePda(program.programId, vaultId);
  const vaultState = await program.account.vaultState.fetch(vaultPda);

  return vaultState;
};

export async function getTransferHookProgramId(
  connection: Connection,
  mintAddress: PublicKey
): Promise<PublicKey | null> {
  const mintInfo = await connection.getAccountInfo(mintAddress);
  if (!mintInfo) {
    throw new Error(`Mint account not found: ${mintAddress.toBase58()}`);
  }
  if (mintInfo.owner.toBase58() !== TOKEN_2022_PROGRAM_ID.toBase58()) {
    return null;
  }

  const mint = unpackMint(mintAddress, mintInfo, TOKEN_2022_PROGRAM_ID);

  const transferHook = getTransferHook(mint);

  if (!transferHook) {
    return null;
  }
  return transferHook.programId;
}

export async function resolveExtraAccountMetas(
  connection: Connection,
  args: WithTransferHookArgs
): Promise<AccountMeta[]> {
  const extraMetaListAddress = getExtraAccountMetaAddress(
    args.mint,
    args.hookProgramId
  );
  const extraMetaListAccount =
    await connection.getAccountInfo(extraMetaListAddress);
  const extraMetasList = getExtraAccountMetas(extraMetaListAccount!);

  const extraHookAccounts: AccountMeta[] = [
    args.from,
    args.mint,
    args.to,
    args.authority,
    extraMetaListAddress
  ].map((account) => ({
    pubkey: account,
    isSigner: false,
    isWritable: true
  }));

  for (const extraMeta of extraMetasList) {
    const extraAccountMeta = await resolveExtraAccountMeta(
      connection,
      extraMeta,
      extraHookAccounts,
      Buffer.from([]),
      args.hookProgramId
    );
    extraHookAccounts.push(extraAccountMeta);
  }

  extraHookAccounts.push({
    pubkey: args.hookProgramId,
    isSigner: false,
    isWritable: false
  });

  return extraHookAccounts;
}

export async function getUserBalanceByAta(
  connection,
  { mintPubkey, userPubkey, tokenProgram }
) {
  const userAta = await getAssociatedTokenAddress(
    mintPubkey,
    userPubkey,
    false,
    tokenProgram
  );

  const balance = await connection
    .getTokenAccountBalance(userAta)
    .then((balance) => balance.value)
    .catch(() => 0);

  return balance;
}

export const useProgram = () => {
  const { connection } = useConnection();
  const { showMainNets } = useAppContext();
  const wallet = useWallet();
  const isDevnet = !showMainNets;

  const provider = useMemo(
    () => makeProvider(connection, wallet, isDevnet),
    [connection, wallet, isDevnet]
  );

  const program = useMemo(
    () => makeVaultProgram(provider, isDevnet),
    [provider, isDevnet]
  );

  return useMemo(() => program, [program]);
};

export function useVault(vaultId) {
  const { connection } = useConnection();
  const { publicKey, signTransaction, signAllTransactions } = useWallet();
  const [config, setConfig] = useState<VaultConfig | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const program = useProgram();

  useEffect(() => {
    if (!connection || !publicKey) {
      setConfig(null);
      return;
    }

    setLoading(true);
    setError(null);

    (async () => {
      try {
        const connection = program.provider.connection;
        const authorityAddress = vaultAuthorityAddress(
          program.programId,
          vaultId
        );
        const vaultStatePk = getVaultStatePda(program.programId, vaultId);

        const vaultState = await getVaultStateById(program, vaultId);
        const assetVaultPk = vaultState.assetVault;
        const shareMintPk = vaultState.shareMint;

        const [assetVaultInfo, shareMintInfo] = await Promise.all([
          connection.getAccountInfo(assetVaultPk),
          connection.getAccountInfo(shareMintPk)
        ]);
        const assetTokenProgram = assetVaultInfo?.owner;
        const shareTokenProgram = shareMintInfo?.owner;

        const assetVault = await getAccount(
          connection,
          assetVaultPk,
          connection.commitment,
          assetTokenProgram
        );
        const assetMintPk = assetVault.mint;

        if (!shareMintInfo) {
          throw new Error("Failed to retrieve mint information");
        }

        const [
          { decimals: assetTokenDecimal },
          { decimals: sharesTokenDecimal }
        ] = await Promise.all([
          getMint(
            connection,
            assetMintPk,
            connection.commitment,
            assetTokenProgram
          ),
          getMint(
            connection,
            shareMintPk,
            connection.commitment,
            shareTokenProgram
          )
        ]);

        let liquidationConfig: {
          mintPubkey: PublicKey;
          tokenProgram: PublicKey;
          redemptionProgramPubkey: PublicKey;
        } | null = null;
        if (vaultState.liquidationTokenVault) {
          const liquidationTokenVaultAccount =
            await program.provider.connection.getAccountInfo(
              vaultState.liquidationTokenVault
            );
          if (!liquidationTokenVaultAccount) {
            throw new Error(
              `Failed to fetch liquidation token vault account at ${vaultState.liquidationTokenVault.toString()}`
            );
          }
          const liquidationTokenProgram = liquidationTokenVaultAccount.owner;

          // Get the mint public key from the liquidation token vault account
          const liquidationTokenVaultTokenAccount = await getAccount(
            connection,
            vaultState.liquidationTokenVault,
            connection.commitment,
            liquidationTokenProgram
          );
          const liquidationTokenMintPubkey =
            liquidationTokenVaultTokenAccount.mint;

          liquidationConfig = {
            mintPubkey: liquidationTokenMintPubkey,
            tokenProgram: liquidationTokenProgram,
            redemptionProgramPubkey: vaultState.redemptionProgram
          };
        }

        const config = {
          adminKp: vaultState.admin,
          statePubkey: vaultStatePk,
          vaultId,
          authorityPubkey: authorityAddress,
          state: vaultState,
          program,
          assetMintPubkey: assetMintPk,
          assetTokenProgram: assetTokenProgram || null,
          assetVaultPubkey: vaultState.assetVault,
          assetTokenDecimal,
          sharesTokenDecimal,
          shareMintPubkey: vaultState.shareMint,
          shareTokenProgram: shareTokenProgram || null,
          navProviderProgram: vaultState.navProviderProgram,

          // Handle liquidation configuration if available
          liquidationTokenVaultPubkey: vaultState.liquidationTokenVault || null,
          liquidationConfig
        };

        setConfig(config);
      } catch (err) {
        setError(err instanceof Error ? err : new Error(String(err)));
      } finally {
        setLoading(false);
      }
    })();
  }, [
    connection,
    publicKey,
    signTransaction,
    signAllTransactions,
    program,
    vaultId
  ]);

  return { config, loading, error };
}

export const useDeposit = ({ vaultId }) => {
  const wallet = useWallet();
  const [value, setValue] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const vault = useVault(vaultId);

  const { accounts: navProviderAccounts } = useGetNavProviderAccounts({
    vaultId: vaultId
  });

  const onDeposit = useCallback(
    async (amountTokens: number) => {
      const { publicKey: userPk, sendTransaction } = wallet;
      if (!userPk || !sendTransaction || !vault || !navProviderAccounts) {
        return;
      }

      const { config } = vault;
      if (!config) {
        return;
      }
      setLoading(true);

      try {
        const program = config.program;
        const connection = program.provider.connection;

        const assetVaultPk = config.assetVaultPubkey;
        const shareMintPk = config.shareMintPubkey;
        const navProviderProgramPk = config.navProviderProgram;

        const amount = toBaseUnits(
          amountTokens.toString(),
          config.assetTokenDecimal
        );

        const [operatorAssetAta, operatorShareAta] = await Promise.all([
          getAssociatedTokenAddress(
            config.assetMintPubkey,
            userPk,
            false,
            config.assetTokenProgram!
          ),
          getAssociatedTokenAddress(
            config.shareMintPubkey,
            userPk,
            false,
            config.shareTokenProgram!
          )
        ]);

        const shareAtaInfo = await connection.getAccountInfo(operatorShareAta);

        let transferHookAccounts: AccountMeta[] = [];
        const transferHookProgramId = await getTransferHookProgramId(
          connection,
          config.assetMintPubkey
        );

        if (transferHookProgramId) {
          const transferHookArgs: WithTransferHookArgs = {
            from: operatorAssetAta,
            mint: config.assetMintPubkey,
            to: config.assetVaultPubkey,
            authority: userPk,
            hookProgramId: transferHookProgramId
          };
          transferHookAccounts = await resolveExtraAccountMetas(
            connection,
            transferHookArgs
          );
        }

        const depositIx = await program.methods
          .deposit(amount, transferHookAccounts.length)
          .accountsPartial({
            operator: userPk,
            vaultState: config.statePubkey,
            vaultAuthority: config.authorityPubkey,
            operatorAssetAta,
            operatorShareAta,
            assetMint: config.assetMintPubkey,
            assetVault: assetVaultPk,
            shareMint: shareMintPk,
            assetTokenProgram: config.assetTokenProgram!,
            shareTokenProgram: config.shareTokenProgram!,
            liquidationTokenMint:
              config?.liquidationConfig?.mintPubkey! || null,
            liquidationTokenVault: config.liquidationTokenVaultPubkey!,
            navProviderProgram: navProviderProgramPk
          })
          .remainingAccounts([...transferHookAccounts, ...navProviderAccounts])
          .instruction();

        const tx = new Transaction();

        if (!shareAtaInfo) {
          tx.add(
            createAssociatedTokenAccountInstruction(
              userPk,
              operatorShareAta,
              userPk,
              shareMintPk,
              config.shareTokenProgram!
            )
          );
        }

        tx.add(depositIx);

        tx.feePayer = userPk;
        tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;

        const signature = await sendTransaction(tx, connection);
        console.log("Deposit successful, signature:", signature);
        setValue(signature);
        return signature;
      } catch (err: any) {
        throw new Error(err instanceof Error ? err.message : String(err));
      } finally {
        setLoading(false);
      }
    },
    [wallet, vault, navProviderAccounts]
  );

  return { onDeposit, loading, value };
};

export const useRedeem = ({ vaultId }) => {
  const [value, setValue] = useState<string | null>(null);
  const wallet = useWallet();
  const [loading, setLoading] = useState(false);

  const vault = useVault(vaultId);

  const { accounts: navProviderAccounts } = useGetNavProviderAccounts({
    vaultId: vaultId
  });

  const onRedeem = useCallback(
    async (amountTokens: number) => {
      const { publicKey: userPk, sendTransaction } = wallet;
      if (!userPk || !sendTransaction || !vault || !navProviderAccounts) {
        return;
      }
      const { config } = vault;
      if (!config) {
        return;
      }
      setLoading(true);

      try {
        const program = config.program;
        const connection = program.provider.connection;
        const assetVaultPk = config.assetVaultPubkey;
        const shareMintPk = config.shareMintPubkey;
        const navProviderProgramPk = config.navProviderProgram;

        const amount = toBaseUnits(
          amountTokens.toString(),
          config.sharesTokenDecimal
        );

        const [operatorAssetAta, operatorShareAta] = await Promise.all([
          getAssociatedTokenAddress(
            config.assetMintPubkey,
            userPk,
            false,
            config.assetTokenProgram!
          ),
          getAssociatedTokenAddress(
            config.shareMintPubkey,
            userPk,
            false,
            config.shareTokenProgram!
          )
        ]);

        let transferHookAccounts: AccountMeta[] = [];
        const transferHookProgramId = await getTransferHookProgramId(
          connection,
          config.assetMintPubkey
        );
        if (transferHookProgramId) {
          const transferHookArgs: WithTransferHookArgs = {
            from: config.assetVaultPubkey,
            mint: config.assetMintPubkey,
            to: operatorAssetAta,
            authority: config.authorityPubkey,
            hookProgramId: transferHookProgramId
          };
          transferHookAccounts = await resolveExtraAccountMetas(
            connection,
            transferHookArgs
          );
        }

        const signature = await program.methods
          .redeem(amount, transferHookAccounts.length)
          .accountsPartial({
            operator: userPk,
            vaultState: config.statePubkey,
            vaultAuthority: config.authorityPubkey,
            operatorAssetAta,
            operatorShareAta,
            assetMint: config.assetMintPubkey,
            assetVault: assetVaultPk,
            shareMint: shareMintPk,
            assetTokenProgram: config.assetTokenProgram!,
            shareTokenProgram: config.shareTokenProgram!,
            liquidationTokenMint:
              config?.liquidationConfig?.mintPubkey! || null,
            liquidationTokenVault: config.liquidationTokenVaultPubkey!,
            navProviderProgram: navProviderProgramPk
          })
          .remainingAccounts([...transferHookAccounts, ...navProviderAccounts])
          .rpc();
        console.log("Redeem signature:", signature);
        setValue(signature);
        return signature;
      } catch (err) {
        console.error("Ошибка депозита:", err);
        throw new Error(
          `Redeem failed: ${err instanceof Error ? err.message : "Unknown error"}`
        );
      } finally {
        setLoading(false);
      }
    },
    [wallet, vault, navProviderAccounts]
  );
  return { onRedeem, loading, value };
};
export const useTokenBalanceState = ({ vaultId = 0, type }) => {
  const program = useProgram();
  const { publicKey: userPk } = useWallet();
  const [balanceState, setBalanceState] = useState<TokenBalance | null>(null);
  const [activeType, setActiveType] = useState("");

  const cancelledRef = useRef(false);
  const intervalRef = useRef<any>(null);

  const fetchBalance = useCallback(async () => {
    cancelledRef.current = false;

    const connection = program.provider.connection;
    if (!connection || !userPk) {
      setBalanceState(null);
      return;
    }

    try {
      const vaultState = await getVaultStateById(program, vaultId);

      let mintPk;
      if (type === "deposit") {
        const assetVaultPk = vaultState.assetVault;
        const assetVaultInfo = await connection.getAccountInfo(assetVaultPk);
        const assetTokenProgram = assetVaultInfo?.owner;
        const assetVault = await getAccount(
          connection,
          assetVaultPk,
          connection.commitment,
          assetTokenProgram
        );
        mintPk = assetVault.mint;
      } else {
        // redeem
        mintPk = vaultState.shareMint;
      }

      const mintInfo = await connection.getAccountInfo(mintPk);

      const userBalance = await getUserBalanceByAta(connection, {
        mintPubkey: mintPk,
        tokenProgram: mintInfo?.owner,
        userPubkey: userPk
      });

      if (!cancelledRef.current) {
        setBalanceState(userBalance);
        setActiveType(type);
      }
    } catch (error) {
      console.error("Failed to fetch token balance", error);
      if (!cancelledRef.current) {
        setBalanceState(null);
      }
    }
  }, [program, userPk, vaultId, type]);

  useEffect(() => {
    fetchBalance();

    intervalRef.current = window.setInterval(() => {
      fetchBalance();
    }, 5000);

    return () => {
      cancelledRef.current = true;
      if (intervalRef.current) {
        window.clearInterval(intervalRef.current);
      }
    };
  }, [fetchBalance]);

  return {
    balanceState,
    refetch: fetchBalance,
    activeType
  };
};

export const useLiquidate = ({ vaultId }) => {
  const [value, setValue] = useState<string | null>(null);
  const wallet = useWallet();
  const [loading, setLoading] = useState(false);

  const vault = useVault(vaultId);
  const { accounts } = useGetNavProviderAccounts({
    vaultId: vaultId
  });

  const onLiquidate = useCallback(
    async (amountTokens: number) => {
      const { publicKey: liquidatorPubkey, sendTransaction } = wallet;
      if (!liquidatorPubkey || !sendTransaction || !vault || !accounts) {
        return;
      }
      const { config } = vault;
      if (!config) {
        return;
      }
      setLoading(true);

      try {
        const program = config.program;
        const connection = program.provider.connection;
        const assetVaultPk = config.assetVaultPubkey;
        const shareMintPk = config.shareMintPubkey;
        const navProviderProgramPk = config.navProviderProgram;

        const shares = toBaseUnits(
          amountTokens.toString(),
          config.sharesTokenDecimal
        );

        const [liquidatorAssetAta, liquidatorShareAta] = await Promise.all([
          getAssociatedTokenAddress(
            config.assetMintPubkey,
            liquidatorPubkey,
            false,
            config.assetTokenProgram!
          ),
          getAssociatedTokenAddress(
            config.shareMintPubkey,
            liquidatorPubkey,
            false,
            config.shareTokenProgram!
          )
        ]);
        const remainingAccounts: any[] = [];
        const navProviderAccounts = navProviderProgramPk ? accounts : [];
        const navProviderAccountsLength = navProviderAccounts.length;

        let transferHookAccounts: AccountMeta[] = [];
        const transferHookProgramId = await getTransferHookProgramId(
          connection,
          config.assetMintPubkey
        );

        let liquidatorLiquidationTokenAta: PublicKey | null = null;
        if (config?.liquidationConfig) {
          liquidatorLiquidationTokenAta = await getAssociatedTokenAddress(
            config?.liquidationConfig?.mintPubkey,
            liquidatorPubkey,
            false,
            config?.liquidationConfig?.tokenProgram
          );

          const redemptionAccounts = [
            {
              pubkey: config?.liquidationConfig?.redemptionProgramPubkey,
              isSigner: false,
              isWritable: true
            }
          ];
          if (transferHookProgramId && redemptionAccounts.length > 0) {
            const transferHookArgs: WithTransferHookArgs = {
              from: config.assetVaultPubkey,
              mint: config.assetMintPubkey,
              to: redemptionAccounts[0].pubkey,
              authority: config.authorityPubkey,
              hookProgramId: transferHookProgramId
            };
            transferHookAccounts = await resolveExtraAccountMetas(
              connection,
              transferHookArgs
            );
            remainingAccounts.push(
              ...transferHookAccounts,
              ...navProviderAccounts,
              ...redemptionAccounts
            );
          }
        } else {
          if (transferHookProgramId) {
            const transferHookArgs: WithTransferHookArgs = {
              from: config.assetVaultPubkey,
              mint: config.assetMintPubkey,
              to: liquidatorAssetAta,
              authority: config.authorityPubkey,
              hookProgramId: transferHookProgramId
            };
            transferHookAccounts = await resolveExtraAccountMetas(
              connection,
              transferHookArgs
            );
          }
          remainingAccounts.push(
            ...transferHookAccounts,
            ...navProviderAccounts
          );
        }
        const computeIx = ComputeBudgetProgram.setComputeUnitLimit({
          units: 300_000
        });

        const signature = await program.methods
          .liquidate(
            shares,
            null,
            transferHookAccounts.length,
            navProviderAccountsLength
          )
          .accountsPartial({
            liquidator: liquidatorPubkey,
            vaultState: config.statePubkey,
            vaultAuthority: config.authorityPubkey,
            liquidatorAssetAta,
            liquidatorShareAta,
            assetMint: config.assetMintPubkey,
            assetVault: assetVaultPk,
            shareMint: shareMintPk,
            assetTokenProgram: config.assetTokenProgram!,
            shareTokenProgram: config.shareTokenProgram!,
            liquidatorLiquidationAta: liquidatorLiquidationTokenAta!,
            liquidationTokenMint:
              config?.liquidationConfig?.mintPubkey! || null,
            liquidationTokenVault: config.liquidationTokenVaultPubkey!,
            navProviderProgram: navProviderProgramPk,
            liquidationTokenProgram:
              config?.liquidationConfig?.tokenProgram! || null,
            redemptionProgram:
              config?.liquidationConfig?.redemptionProgramPubkey! || null
          })
          .remainingAccounts(remainingAccounts)
          .preInstructions([computeIx])
          .rpc();
        console.log("Redeem signature:", signature);
        setValue(signature);
        return signature;
      } catch (err: any) {
        throw new Error(`Liquidate failed: ${err.message || err}`);
      } finally {
        setLoading(false);
      }
    },
    [wallet, vault, accounts]
  );
  return { onLiquidate, loading, value };
};

export const useAddLiquidator = (vaultId) => {
  const [loading, setLoading] = useState(false);
  const program = useProgram();
  const [value, setValue] = useState<string | null>(null);

  const addLiquidator = async (liquidatorAddress) => {
    try {
      setLoading(true);
      const vaultState = await getVaultStateById(program, vaultId);
      const adminPk = vaultState.admin;
      const vaultStatePk = getVaultStatePda(program.programId, vaultId);

      const signature = await program.methods
        .addLiquidator(new PublicKey(liquidatorAddress))
        .accountsPartial({ vaultState: vaultStatePk, admin: adminPk })
        .rpc();
      console.log(
        `Liquidator added successfully. Transaction signature: ${signature}`
      );
      setValue(signature);
      return signature;
    } catch (error) {
      console.error("Error adding liquidator:", error);
      throw new Error(
        `Failed to add liquidator: ${error instanceof Error ? error.message : String(error)}`
      );
    } finally {
      setLoading(false);
    }
  };

  return {
    addLiquidator,
    loading,
    value
  };
};

export const useChangeAdmin = (vaultId) => {
  const [value, setValue] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const program = useProgram();

  const changeAdmin = async (newAdminAddress: string) => {
    try {
      setLoading(true);
      const vaultState = await getVaultStateById(program, vaultId);
      const oldAdminKp = vaultState.admin;
      const vaultStatePk = getVaultStatePda(program.programId, vaultId);

      const signature = await program.methods
        .changeAdmin(new PublicKey(newAdminAddress))
        .accountsPartial({ vaultState: vaultStatePk, admin: oldAdminKp })
        .rpc();
      console.log(
        `changeAdmin successfully. Transaction signature: ${signature}`
      );
      setValue(signature);
      return signature;
    } catch (error) {
      console.error("Error changeAdmin:", error);
      throw new Error(
        `Failed to change admin: ${error instanceof Error ? error.message : String(error)}`
      );
    } finally {
      setLoading(false);
    }
  };

  return {
    changeAdmin,
    loading,
    value
  };
};

export const useAddRedeemer = (vaultId) => {
  const [value, setValue] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const program = useProgram();

  const addRedeemer = async (redeemerAddress: string) => {
    console.log("addRedeemer", redeemerAddress);
    try {
      setLoading(true);
      const vaultState = await getVaultStateById(program, vaultId);
      const adminPk = vaultState.admin;
      const vaultStatePk = getVaultStatePda(program.programId, vaultId);
      console.log(vaultState);
      const signature = await program.methods
        .addOperator(new PublicKey(redeemerAddress))
        .accountsPartial({ vaultState: vaultStatePk, admin: adminPk })
        .rpc();
      console.log(
        `Liquidator added successfully. Transaction signature: ${signature}`
      );
      setValue(signature);
      return signature;
    } catch (error) {
      console.error("Error adding liquidator:", error);
      throw new Error(
        `Failed to add redeemer: ${error instanceof Error ? error.message : String(error)}`
      );
    } finally {
      setLoading(false);
    }
  };

  return {
    addRedeemer,
    loading,
    value
  };
};

export const useIsRole = ({ vaultId }) => {
  const [value, setValue] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const program = useProgram();

  const isRole = useCallback(
    async ({
      role,
      userAddress
    }: {
      role: "isAdmin" | "isLiquidator" | "isOperator";
      userAddress: string;
    }) => {
      try {
        setLoading(true);
        const userPubkey = new PublicKey(userAddress);
        const methodFn = program.methods[role];
        const vaultStatePk = getVaultStatePda(program.programId, vaultId);
        const isRole = await methodFn(userPubkey)
          .accountsPartial({
            vaultState: vaultStatePk
          })
          .view();
        setValue(isRole.toString());
        return isRole;
      } catch (error) {
        console.error("Error isRole:", error);
        throw new Error(
          `Failed to isRole: ${error instanceof Error ? error.message : String(error)}`
        );
      } finally {
        setLoading(false);
      }
    },
    [program.methods, program.programId, vaultId]
  );

  return {
    value,
    execute: isRole,
    isLoading: loading
  };
};
