import { AnchorProvider, BN, Program } from "@project-serum/anchor";
import { getAssociatedTokenAddress } from "@solana/spl-token";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { Connection, PublicKey } from "@solana/web3.js";

import { getVaultProgram } from "../helpers";

async function depositAssets(
  connection,
  wallet,
  vaultStatePk,
  assetMint,
  shareMint,
  amount,
  navProviderProgram,
  navProviderAccounts
) {
  const provider = new AnchorProvider(
    connection,
    wallet,
    AnchorProvider.defaultOptions()
  );

  const program = getVaultProgram({ provider });

  const [vaultAuthority] = await PublicKey.findProgramAddress(
    [Buffer.from("vault_authority"), vaultStatePk.toBuffer()],
    program.programId
  );

  // ассоциированные аккаунты оператора
  const operator = wallet.publicKey;
  const operatorAssetAta = await getAssociatedTokenAddress(assetMint, operator);
  const operatorShareAta = await getAssociatedTokenAddress(shareMint, operator);

  // получаем адрес assetVault из состояния
  const vaultState = await program.account.vaultState.fetch(vaultStatePk);
  const assetVault = new PublicKey(vaultState.assetVault);

  // вызываем инструкцию deposit
  await program.rpc.deposit(new BN(amount), {
    accounts: {
      operator,
      operatorAssetAta,
      operatorShareAta,
      assetMint,
      assetVault,
      shareMint,
      vaultState: vaultStatePk,
      vaultAuthority,
      navProviderProgram,
      assetTokenProgram: TOKEN_PROGRAM_ID,
      shareTokenProgram: TOKEN_PROGRAM_ID
      // liquidation_token_mint, liquidation_token_vault — только если нужны
    },
    remainingAccounts: navProviderAccounts
  });

  console.log("Deposit успешно выполнен");
}
