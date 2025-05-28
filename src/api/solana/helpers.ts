import { useEffect, useState } from "react";

import { getAccount } from "@solana/spl-token";
import { AccountMeta, PublicKey } from "@solana/web3.js";

import { useAppContext } from "@/utils/AppContext";
import { getVaultStateById, useProgram } from "@/utils/anchorHelpers";

import NAV_PROVIDER_CONFIGS from "./configs/nav-provider.config.json";

export function getNavProviderAccounts(
  navProviderProgramId: PublicKey,
  assetMint: PublicKey,
  isDevnet: boolean
): Array<AccountMeta> {
  const cluster = isDevnet ? "devnet" : "mainnet";

  const config = NAV_PROVIDER_CONFIGS[cluster];
  if (!config) {
    throw new Error(`No NAV provider config found for cluster: ${cluster}`);
  }
  const navProviderConfigs = config[navProviderProgramId.toBase58()];
  if (!navProviderConfigs) {
    throw new Error(
      `No NAV provider config found for program ID: ${navProviderProgramId.toBase58()}`
    );
  }
  let navProviderConfigByAsset = navProviderConfigs[assetMint.toBase58()];
  if (!navProviderConfigByAsset) {
    console.warn(
      `No specific NAV provider config found for asset mint: ${assetMint.toBase58()}. Using default config.`
    );
    navProviderConfigByAsset = navProviderConfigs["default"];
  }
  if (!navProviderConfigByAsset) {
    throw new Error(
      `No default NAV provider config found for program ID: ${navProviderProgramId.toBase58()}`
    );
  }

  try {
    const navProviderAccounts = navProviderConfigByAsset.accounts.map(
      (account: string) => {
        return {
          pubkey: account ? new PublicKey(account) : PublicKey.default,
          isSigner: false,
          isWritable: false
        };
      }
    );

    return navProviderAccounts;
  } catch (error) {
    console.error(
      `Error getting NAV provider accounts: ${error instanceof Error ? error.message : String(error)}`
    );
    throw error;
  }
}

export const useGetNavProviderAccounts = ({ vaultId }) => {
  const [accounts, setAccounts] = useState<AccountMeta[] | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const ctx = useAppContext();
  const isDevnet = !ctx.showMainNets;
  const program = useProgram();

  useEffect(() => {
    if (!program) return;

    let cancelled = false;
    setIsLoading(true);
    setError(null);

    (async () => {
      try {
        const connection = program.provider.connection;
        const vaultState = await getVaultStateById(program, vaultId);
        const {
          navProviderProgram: navProviderProgramId,
          assetVault: assetVaultPk
        } = vaultState;

        // fetch the SPL‐Token account to get the mint
        const vaultInfo = await connection.getAccountInfo(assetVaultPk);
        const assetTokenProgram = vaultInfo?.owner!;
        const assetVault = await getAccount(
          connection,
          assetVaultPk,
          connection.commitment,
          assetTokenProgram
        );
        const assetMintPk = assetVault.mint;

        // derive and set nav provider PDAs
        const navAccounts = getNavProviderAccounts(
          navProviderProgramId!,
          assetMintPk!,
          isDevnet
        );
        if (!cancelled) setAccounts(navAccounts);
      } catch (err) {
        console.error("Error fetching NAV provider accounts:", err);
        if (!cancelled) setError(err as Error);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [program, vaultId, isDevnet]);

  return { accounts, isLoading, error };
};
