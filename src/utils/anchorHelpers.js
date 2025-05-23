/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMemo } from "react";

import { AnchorProvider, BN, Program } from "@coral-xyz/anchor";
import { getOrCreateAssociatedTokenAccount } from "@solana/spl-token";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";

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
