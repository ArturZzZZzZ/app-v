import { PublicKey } from "@solana/web3.js";

import { useProgram } from "./anchorHelpers";

export interface TokenBalance {
  amount: string;
  decimals: number;
  uiAmount: number;
  uiAmountString: string;
}

export interface LiquidationConfig {
  mintPubkey: PublicKey;
  tokenProgram: PublicKey;
  redemptionProgramPubkey: PublicKey;
}

export interface VaultConfig {
  adminKp: PublicKey;
  statePubkey: PublicKey;
  vaultId: number;
  authorityPubkey: PublicKey;
  state: VaultState;
  program: ReturnType<typeof useProgram>;
  assetMintPubkey: PublicKey;
  assetTokenProgram: PublicKey | null;
  assetVaultPubkey: PublicKey;
  assetTokenDecimal: number;
  shareMintPubkey: PublicKey;
  shareTokenProgram: PublicKey;
  navProviderProgram: PublicKey;
  liquidationTokenVaultPubkey: PublicKey | null;
  liquidationConfig: LiquidationConfig | null;
}

export interface VaultState {
  id: number;
  admin: PublicKey;
  isPaused: boolean;
  assetVault: PublicKey;
  shareMint: PublicKey;
  liquidationOpenToPublic: boolean;
  liquidationTokenVault: PublicKey | null;
  redemptionProgram: PublicKey | null;
  navProviderProgram: PublicKey;
  vaultAuthorityBump: number;
  bump: number;
  operators: PublicKey[];
  liquidators: PublicKey[];
}
