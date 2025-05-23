/* eslint-disable @typescript-eslint/no-explicit-any */
import { useCallback, useEffect, useMemo, useState } from "react";

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
  const vaultPda = getVaultStatePda(program.programId, vaultId.toString());
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

export const useDeposit = () => {
  const wallet = useWallet();
  const [loading, setLoading] = useState(false);

  const vaultId = 0;
  const vaultProgramId = new PublicKey(
    "9N3yqarWXmXJ9NQBGgN47JXV82smby8nSMffkwetgYov"
  );

  const vaultStatePk = getVaultStatePda(vaultProgramId, vaultId);
  const authorityAddress = vaultAuthorityAddress(vaultProgramId, vaultId);

  const program = useProgram();

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

export const useRedeem = () => {
  const wallet = useWallet();
  const [loading, setLoading] = useState(false);
  const vaultId = 0;
  const vaultProgramId = new PublicKey(
    "9N3yqarWXmXJ9NQBGgN47JXV82smby8nSMffkwetgYov"
  );

  const vaultStatePk = getVaultStatePda(vaultProgramId, vaultId);
  const authorityAddress = vaultAuthorityAddress(vaultProgramId, vaultId);

  const program = useProgram();
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
  const [balanceState, setBalanceState] = useState(null);

  useEffect(() => {
    let cancelled = false;
    const connection = program.provider.connection;

    if (!connection || !userPk) {
      setBalanceState(null);
      return;
    }

    (async () => {
      try {
        let vaultPk;
        let mintPk;
        const vaultState = await getVaultStateById(program, vaultId);

        if (type === "deposit") {
          vaultPk = vaultState.assetVault;
          const assetVaultState = await getAccount(connection, vaultPk);
          mintPk = assetVaultState.mint;
        } else if (type === "redeem") {
          vaultPk = vaultState.assetVault;
          mintPk = vaultState.shareMint;
        }

        const shareMintInfo = await connection.getAccountInfo(mintPk);
        if (!shareMintInfo) {
          if (!cancelled) setBalanceState(null);
          return;
        }

        const balanceState = await getUserBalanceByAta(connection, {
          mintPubkey: mintPk,
          tokenProgram: shareMintInfo.owner,
          userPubkey: userPk
        });

        if (!cancelled) {
          setBalanceState(balanceState);
        }
      } catch (error) {
        console.error("Failed to fetch token balance", error);
        if (!cancelled) {
          setBalanceState(null);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [program, userPk, vaultId, type]);

  return { balanceState };
};
