/* eslint-disable @typescript-eslint/no-explicit-any */
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

export const useDeposit = ({ vaultId }) => {
  const wallet = useWallet();
  const [loading, setLoading] = useState(false);

  const program = useProgram();

  const vaultStatePk = getVaultStatePda(program.programId, vaultId);
  const authorityAddress = vaultAuthorityAddress(program.programId, vaultId);

  const onDeposit = useCallback(
    async (amountTokens) => {
      const { publicKey: userPk, sendTransaction } = wallet;
      if (!userPk || !sendTransaction) {
        alert("Please connect your wallet");
        return;
      }
      setLoading(true);

      try {
        const connection = program.provider.connection;

        const vaultState = await getVaultStateById(program, vaultId);
        const assetVaultPk = vaultState.assetVault;
        const shareMintPk = vaultState.shareMint;
        const navProviderProgramPk = vaultState.navProviderProgram;
        const liquidationTokenVaultPk = vaultState.liquidationTokenVault;

        const liquidationTokenMintPk = liquidationTokenVaultPk
          ? (await getAccount(connection, liquidationTokenVaultPk)).mint
          : null;

        const assetVaultState = await getAccount(connection, assetVaultPk);
        const assetMintPk = assetVaultState.mint;

        const [{ decimals: tokenDecimal }, shareMintInfo, assetMintInfo] =
          await Promise.all([
            getMint(connection, assetMintPk),
            connection.getAccountInfo(shareMintPk),
            connection.getAccountInfo(assetMintPk)
          ]);

        if (!shareMintInfo || !assetMintInfo) {
          throw new Error("Failed to retrieve mint information");
        }

        const amount = toBaseUnits(amountTokens.toString(), tokenDecimal);

        const [operatorAssetAta, operatorShareAta] = await Promise.all([
          getAssociatedTokenAddress(
            assetMintPk,
            userPk,
            false,
            assetMintInfo.owner
          ),
          getAssociatedTokenAddress(
            shareMintPk,
            userPk,
            false,
            shareMintInfo.owner
          )
        ]);

        const shareAtaInfo = await connection.getAccountInfo(operatorShareAta);

        const depositIx = await program.methods
          .deposit(amount)
          .accountsPartial({
            operator: userPk,
            vaultState: vaultStatePk,
            vaultAuthority: authorityAddress,
            operatorAssetAta,
            operatorShareAta,
            assetMint: assetMintPk,
            assetVault: assetVaultPk,
            shareMint: shareMintPk,
            assetTokenProgram: assetMintInfo.owner,
            shareTokenProgram: shareMintInfo.owner,
            liquidationTokenMint: liquidationTokenMintPk,
            liquidationTokenVault: liquidationTokenVaultPk,
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
              shareMintInfo.owner
            )
          );
        }

        tx.add(depositIx);

        tx.feePayer = userPk;
        tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;

        const signature = await sendTransaction(tx, connection);
        console.log("Deposit successful, signature:", signature);
        return signature;
      } catch (err) {
        console.error("deposit error:", err);
        throw new Error(err);
      } finally {
        setLoading(false);
      }
    },
    [wallet, program, vaultStatePk, authorityAddress]
  );

  return { onDeposit, loading };
};

export const useRedeem = ({ vaultId }) => {
  const wallet = useWallet();
  const program = useProgram();
  const [loading, setLoading] = useState(false);

  const vaultStatePk = getVaultStatePda(program.programId, vaultId);
  const authorityAddress = vaultAuthorityAddress(program.programId, vaultId);

  const onRedeem = useCallback(
    async (amountTokens) => {
      const { publicKey: userPk, sendTransaction } = wallet;
      if (!userPk || !sendTransaction) {
        alert("Please connect your wallet");
        return;
      }
      setLoading(true);

      try {
        const connection = program.provider.connection;

        const vaultState = await getVaultStateById(program, vaultId);
        const assetVaultPk = vaultState.assetVault;
        const shareMintPk = vaultState.shareMint;
        const navProviderProgramPk = vaultState.navProviderProgram;
        const liquidationTokenVaultPk = vaultState.liquidationTokenVault;

        const liquidationTokenMintPk = liquidationTokenVaultPk
          ? (await getAccount(connection, liquidationTokenVaultPk)).mint
          : null;

        const assetVaultState = await getAccount(connection, assetVaultPk);
        const assetMintPk = assetVaultState.mint;

        const [shareMintInfo, assetMintInfo] = await Promise.all([
          connection.getAccountInfo(shareMintPk),
          connection.getAccountInfo(assetMintPk)
        ]);

        if (!shareMintInfo || !assetMintInfo) {
          throw new Error("Failed to retrieve mint information");
        }

        const amount = new BN(amountTokens);

        const [operatorAssetAta, operatorShareAta] = await Promise.all([
          getAssociatedTokenAddress(
            assetMintPk,
            userPk,
            false,
            assetMintInfo.owner
          ),
          getAssociatedTokenAddress(
            shareMintPk,
            userPk,
            false,
            shareMintInfo.owner
          )
        ]);

        const signature = await program.methods
          .redeem(amount)
          .accountsPartial({
            operator: userPk,
            vaultState: vaultStatePk,
            vaultAuthority: authorityAddress,
            operatorAssetAta,
            operatorShareAta,
            assetMint: assetMintPk,
            assetVault: assetVaultPk,
            shareMint: shareMintPk,
            assetTokenProgram: assetMintInfo.owner,
            shareTokenProgram: shareMintInfo.owner,
            liquidationTokenMint: liquidationTokenMintPk,
            liquidationTokenVault: liquidationTokenVaultPk,
            navProviderProgram: navProviderProgramPk
          })
          .remainingAccounts([
            { pubkey: PublicKey.default, isSigner: false, isWritable: false }
          ])
          .rpc();
        console.log("Redeem signature:", signature);
        return signature;
      } catch (err) {
        console.error("Error redeem:", err);
        throw new Error(err);
      } finally {
        setLoading(false);
      }
    },
    [wallet, program, vaultStatePk, authorityAddress]
  );
  return { onRedeem, loading };
};

export const useTokenBalanceState = ({ vaultId = 0, type }) => {
  const program = useProgram();
  const { publicKey: userPk } = useWallet();
  const [balanceState, setBalanceState] = useState(0);

  const cancelledRef = useRef(false);

  const fetchBalance = useCallback(async () => {
    cancelledRef.current = false;

    const connection = program.provider.connection;
    if (!connection || !userPk) {
      setBalanceState(0);
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
      if (!mintInfo) {
        if (!cancelledRef.current) setBalanceState(0);
        return;
      }

      const userBalance = await getUserBalanceByAta(connection, {
        mintPubkey: mintPk,
        tokenProgram: mintInfo.owner,
        userPubkey: userPk
      });

      if (!cancelledRef.current) {
        setBalanceState(userBalance);
      }
    } catch (error) {
      console.error("Failed to fetch token balance", error);
      if (!cancelledRef.current) {
        setBalanceState(0);
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
    refetch: fetchBalance
  };
};

export function useVault(vaultId) {
  const { connection } = useConnection();
  const { publicKey, signTransaction, signAllTransactions } = useWallet();
  const [vault, setVault] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const program = useProgram();

  useEffect(() => {
    if (!connection || !publicKey) {
      setVault(null);
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

        const assetVaultState = await getAccount(connection, assetVaultPk);
        const assetMintPk = assetVaultState.mint;

        const [{ decimals: assetTokenDecimal }, shareMintInfo, assetMintInfo] =
          await Promise.all([
            getMint(connection, assetMintPk),
            connection.getAccountInfo(shareMintPk),
            connection.getAccountInfo(assetMintPk)
          ]);

        if (!shareMintInfo || !assetMintInfo) {
          throw new Error("Failed to retrieve mint information");
        }

        const assetTokenProgram = assetMintInfo.owner;
        const shareTokenProgram = shareMintInfo.owner;

        let liquidationConfig = null;
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
          shareTokenProgram: shareTokenProgram,
          navProviderProgram: vaultState.navProviderProgram,

          // Handle liquidation configuration if available
          liquidationTokenVaultPubkey: vaultState.liquidationTokenVault || null,
          liquidationConfig
        };

        setVault(config);
      } catch (err) {
        setError(err);
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

  return { vault, loading, error };
}

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
      throw new Error(`Failed to add liquidator: ${error.message || error}`);
    } finally {
      setLoading(false);
    }
  };

  return {
    addLiquidator,
    loading
  };
};
