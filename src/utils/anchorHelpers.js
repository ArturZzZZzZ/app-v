/* eslint-disable @typescript-eslint/no-explicit-any */
import { useCallback, useMemo, useState } from "react";

import { AnchorProvider, BN, Program } from "@coral-xyz/anchor";
import {
  createAssociatedTokenAccountInstruction,
  getAccount,
  getAssociatedTokenAddress,
  getMint,
  getOrCreateAssociatedTokenAccount
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
  { mintPubkey, userPubkey, adminKp, tokenProgram }
) {
  const tokenAccount = await getOrCreateAssociatedTokenAccount(
    connection,
    adminKp,
    mintPubkey,
    userPubkey,
    false,
    connection.commitment,
    {},
    tokenProgram
  );
  // decimal also here
  const balance = await connection
    .getTokenAccountBalance(tokenAccount.address)
    .then((balance) => balance.value.uiAmountString)
    .catch(() => 0);

  return balance;
}

export const useProgram = () => {
  const { connection } = useConnection();
  const wallet = useWallet();

  const provider = makeProvider(connection, wallet);

  const program = makeVaultProgram(provider);

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
        alert("Пожалуйста, подключите кошелёк");
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
          throw new Error("Не удалось получить информацию о mint-ах");
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
