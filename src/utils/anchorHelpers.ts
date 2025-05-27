import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { AnchorProvider, BN, Program } from "@coral-xyz/anchor";
import {
  createAssociatedTokenAccountInstruction,
  getAccount,
  getAssociatedTokenAddress,
  getMint
} from "@solana/spl-token";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { PublicKey, Transaction } from "@solana/web3.js";

import idl from "../api/solana/idls/sc_vault.json";

export interface TokenBalance {
  amount: string;
  decimals: number;
  uiAmount: number;
  uiAmountString: string;
}

export function makeProvider(connection, wallet) {
  const opts = AnchorProvider.defaultOptions();
  const provider = new AnchorProvider(connection, wallet, opts);
  return provider;
}

export function makeVaultProgram(provider) {
  return new Program(idl, provider);
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
  const wallet = useWallet();

  const provider = useMemo(
    () => makeProvider(connection, wallet),
    [connection, wallet]
  );

  const program = useMemo(() => makeVaultProgram(provider), [provider]);

  return useMemo(() => program, [program]);
};

export function useVault(vaultId) {
  const { connection } = useConnection();
  const { publicKey, signTransaction, signAllTransactions } = useWallet();
  const [config, setConfig] = useState<any>(null);
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

        const assetVaultInfo = await connection.getAccountInfo(assetVaultPk);
        const assetTokenProgram = assetVaultInfo?.owner;
        const assetVault = await getAccount(
          connection,
          assetVaultPk,
          connection.commitment,
          assetTokenProgram
        );

        const assetMintPk = assetVault.mint;

        const [{ decimals: assetTokenDecimal }, shareMintInfo] =
          await Promise.all([
            getMint(
              connection,
              assetMintPk,
              connection.commitment,
              assetTokenProgram
            ),
            connection.getAccountInfo(shareMintPk)
          ]);

        if (!shareMintInfo) {
          throw new Error("Failed to retrieve mint information");
        }

        const shareTokenProgram = shareMintInfo.owner;

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
          assetTokenProgram,
          assetVaultPubkey: vaultState.assetVault,
          assetTokenDecimal,
          shareMintPubkey: vaultState.shareMint,
          shareTokenProgram,
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
  const [loading, setLoading] = useState(false);

  const vault = useVault(vaultId);

  const program = useProgram();
  const onDeposit = useCallback(
    async (amountTokens: number) => {
      const { publicKey: userPk, sendTransaction } = wallet;
      if (!userPk || !sendTransaction || !vault) {
        return;
      }
      const { config } = vault;
      if (!config) {
        return;
      }
      setLoading(true);

      try {
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
            config.assetTokenProgram
          ),
          getAssociatedTokenAddress(
            config.shareMintPubkey,
            userPk,
            false,
            config.shareTokenProgram
          )
        ]);

        const shareAtaInfo = await connection.getAccountInfo(operatorShareAta);

        const depositIx = await program.methods
          .deposit(amount)
          .accountsPartial({
            operator: userPk,
            vaultState: config.statePubkey,
            vaultAuthority: config.authorityPubkey,
            operatorAssetAta,
            operatorShareAta,
            assetMint: config.assetMintPubkey,
            assetVault: assetVaultPk,
            shareMint: shareMintPk,
            assetTokenProgram: config.assetTokenProgram,
            shareTokenProgram: config.shareTokenProgram,
            liquidationTokenMint: config?.liquidationConfig?.mintPubkey || null,
            liquidationTokenVault: config.liquidationTokenVaultPubkey,
            navProviderProgram: navProviderProgramPk
          })
          .remainingAccounts([
            { pubkey: PublicKey.default, isSigner: false, isWritable: false }
          ])
          .instruction();

        const tx = new Transaction();

        if (!shareAtaInfo) {
          tx.add(
            createAssociatedTokenAccountInstruction(
              userPk,
              operatorShareAta,
              userPk,
              shareMintPk,
              config.shareTokenProgram
            )
          );
        }

        tx.add(depositIx);

        tx.feePayer = userPk;
        tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;

        const signature = await sendTransaction(tx, connection);
        console.log("Deposit successful, signature:", signature);
        return signature;
      } catch (err: any) {
        throw new Error(err instanceof Error ? err.message : String(err));
      } finally {
        setLoading(false);
      }
    },
    [wallet, vault, program.provider.connection, program.methods]
  );

  return { onDeposit, loading };
};

export const useRedeem = ({ vaultId }) => {
  const wallet = useWallet();
  const [loading, setLoading] = useState(false);

  const vault = useVault(vaultId);
  const program = useProgram();

  const onRedeem = useCallback(
    async (amountTokens: number) => {
      const { publicKey: userPk, sendTransaction } = wallet;
      if (!userPk || !sendTransaction || !vault) {
        return;
      }
      const { config } = vault;
      if (!config) {
        return;
      }
      setLoading(true);

      try {
        const assetVaultPk = config.assetVaultPubkey;
        const shareMintPk = config.shareMintPubkey;
        const navProviderProgramPk = config.navProviderProgram;

        const amount = new BN(amountTokens);

        const [operatorAssetAta, operatorShareAta] = await Promise.all([
          getAssociatedTokenAddress(
            config.assetMintPubkey,
            userPk,
            false,
            config.assetTokenProgram
          ),
          getAssociatedTokenAddress(
            config.shareMintPubkey,
            userPk,
            false,
            config.shareTokenProgram
          )
        ]);

        const signature = await program.methods
          .redeem(amount)
          .accountsPartial({
            operator: userPk,
            vaultState: config.statePubkey,
            vaultAuthority: config.authorityPubkey,
            operatorAssetAta,
            operatorShareAta,
            assetMint: config.assetMintPubkey,
            assetVault: assetVaultPk,
            shareMint: shareMintPk,
            assetTokenProgram: config.assetTokenProgram,
            shareTokenProgram: config.shareTokenProgram,
            liquidationTokenMint: config?.liquidationConfig?.mintPubkey || null,
            liquidationTokenVault: config.liquidationTokenVaultPubkey,
            navProviderProgram: navProviderProgramPk
          })
          .remainingAccounts([
            { pubkey: PublicKey.default, isSigner: false, isWritable: false }
          ])
          .rpc();
        console.log("Redeem signature:", signature);
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
    [wallet, vault, program.methods]
  );
  return { onRedeem, loading };
};
export const useTokenBalanceState = ({ vaultId = 0, type }) => {
  const program = useProgram();
  const { publicKey: userPk } = useWallet();
  const [balanceState, setBalanceState] = useState<TokenBalance | null>(null);
  const [activeType, setActiveType] = useState("");

  const cancelledRef = useRef(false);

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
        const assetVaultAccount = await getAccount(
          connection,
          vaultState.assetVault
        );
        mintPk = assetVaultAccount.mint;
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
    return () => {
      cancelledRef.current = true;
    };
  }, [fetchBalance]);

  return {
    balanceState,
    refetch: fetchBalance,
    activeType
  };
};

export const useLiquidate = ({ vaultId }) => {
  const wallet = useWallet();
  const [loading, setLoading] = useState(false);

  const program = useProgram();
  const vault = useVault(vaultId);

  const onLiquidate = useCallback(
    async (amountTokens: number) => {
      const { publicKey: liquidatorPubkey, sendTransaction } = wallet;
      if (!liquidatorPubkey || !sendTransaction || !vault) {
        return;
      }
      const { config } = vault;
      if (!config) {
        return;
      }
      setLoading(true);

      try {
        const assetVaultPk = config.assetVaultPubkey;
        const shareMintPk = config.shareMintPubkey;
        const navProviderProgramPk = config.navProviderProgram;

        const shares = new BN(amountTokens);

        const [liquidatorAssetAta, liquidatorShareAta] = await Promise.all([
          getAssociatedTokenAddress(
            config.assetMintPubkey,
            liquidatorPubkey,
            false,
            config.assetTokenProgram
          ),
          getAssociatedTokenAddress(
            config.shareMintPubkey,
            liquidatorPubkey,
            false,
            config.shareTokenProgram
          )
        ]);
        const remainingAccounts: any[] = [];
        const navProviderAccounts = navProviderProgramPk
          ? [
              { pubkey: PublicKey.default, isSigner: false, isWritable: false },
              { pubkey: PublicKey.default, isSigner: false, isWritable: false }
            ]
          : [];
        const navProviderAccountsLength = navProviderAccounts.length;

        remainingAccounts.push(...navProviderAccounts);

        let liquidatorLiquidationTokenAta: PublicKey | null = null;

        if (config?.liquidationConfig) {
          liquidatorLiquidationTokenAta = await getAssociatedTokenAddress(
            config?.liquidationConfig?.mintPubkey,
            liquidatorPubkey,
            false,
            config?.liquidationConfig?.tokenProgram
          );

          remainingAccounts.push(
            ...(config?.liquidationConfig?.redemptionProgramPubkey
              ? [config.liquidationConfig.redemptionProgramPubkey]
              : [])
          );
        }

        const signature = await program.methods
          .liquidate(shares, null, navProviderAccountsLength)
          .accountsPartial({
            liquidator: liquidatorPubkey,
            vaultState: config.statePubkey,
            vaultAuthority: config.authorityPubkey,
            liquidatorAssetAta,
            liquidatorShareAta,
            assetMint: config.assetMintPubkey,
            assetVault: assetVaultPk,
            shareMint: shareMintPk,
            assetTokenProgram: config.assetTokenProgram,
            shareTokenProgram: config.shareTokenProgram,
            liquidatorLiquidationAta: liquidatorLiquidationTokenAta!,
            liquidationTokenMint: config?.liquidationConfig?.mintPubkey || null,
            liquidationTokenVault: config.liquidationTokenVaultPubkey,
            navProviderProgram: navProviderProgramPk,
            liquidationTokenProgram:
              config?.liquidationConfig?.tokenProgram || null,
            redemptionProgram:
              config?.liquidationConfig?.redemptionProgramPubkey || null
          })
          .remainingAccounts(remainingAccounts)
          .rpc();
        console.log("Redeem signature:", signature);
        return signature;
      } catch (err: any) {
        throw new Error(`Liquidate failed: ${err.message || err}`);
      } finally {
        setLoading(false);
      }
    },
    [vault, wallet, program.methods]
  );
  return { onLiquidate, loading };
};

export const useAddLiquidator = (vaultId) => {
  const [loading, setLoading] = useState(false);
  const program = useProgram();

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
    loading
  };
};

export const useChangeAdmin = (vaultId) => {
  const [loading, setLoading] = useState(false);

  const program = useProgram();

  const changeAdmin = async (newAdminAddress: string) => {
    try {
      setLoading(true);
      const vaultState = await getVaultStateById(program, vaultId);
      const oldAdminKp = vaultState.admin;
      const vaultStatePk = getVaultStatePda(program.programId, vaultId);
      console.log(123213, oldAdminKp.toString());

      const signature = await program.methods
        .changeAdmin(new PublicKey(newAdminAddress))
        .accountsPartial({ vaultState: vaultStatePk, admin: oldAdminKp })
        .rpc();
      console.log(
        `changeAdmin successfully. Transaction signature: ${signature}`
      );
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
    loading
  };
};

export const useAddRedeemer = (vaultId) => {
  const [loading, setLoading] = useState(false);

  const program = useProgram();

  const addRedeemer = async (redeemerAddress: string) => {
    console.log("addRedeemer", redeemerAddress);
    try {
      setLoading(true);
      const vaultState = await getVaultStateById(program, vaultId);
      const adminPk = vaultState.admin;
      const vaultStatePk = getVaultStatePda(program.programId, vaultId);
      console.log({
        vaultStatePk: vaultStatePk.toString(),
        adminPk: adminPk.toString()
      });
      const signature = await program.methods
        .addOperator(new PublicKey(redeemerAddress))
        .accountsPartial({ vaultState: vaultStatePk, admin: adminPk })
        .rpc();
      console.log(
        `Liquidator added successfully. Transaction signature: ${signature}`
      );
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
    loading
  };
};
