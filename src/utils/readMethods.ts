import { useCallback, useRef, useState } from "react";

import { useGetNavProviderAccounts } from "@/api/solana/helpers";
import { BN } from "@coral-xyz/anchor";
import { getAccount, getMint } from "@solana/spl-token";
import { PublicKey } from "@solana/web3.js";

import { useVault } from "@/utils/anchorHelpers";

import {
  getUserBalanceByAta,
  getVaultStateById,
  useProgram
} from "./anchorHelpers";
import { LiquidationConfig, TokenBalance, VaultState } from "./type";

type UseTokenBalanceStateProps = {
  vaultId?: number;
  type: "deposit" | "redeem";
};

export const useTokenBalanceStateByAddress = ({
  vaultId = 0,
  type
}: UseTokenBalanceStateProps) => {
  const program = useProgram();
  const [balanceState, setBalanceState] = useState<TokenBalance | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeType, setActiveType] = useState<"deposit" | "redeem" | "">("");
  const cancelledRef = useRef(false);

  const fetchBalance = useCallback(
    async (userAddress: string) => {
      cancelledRef.current = false;

      const connection = program.provider.connection;
      if (!connection || !userAddress) {
        setBalanceState(null);
        return;
      }

      try {
        setIsLoading(true);
        const userPk = new PublicKey(userAddress);

        const vaultState = await getVaultStateById(program, vaultId);

        let mintPk;
        if (type === "deposit") {
          const assetVaultAccount = await getAccount(
            connection,
            vaultState.assetVault
          );
          mintPk = assetVaultAccount.mint;
        } else {
          mintPk = vaultState.shareMint;
        }

        const mintInfo = await connection.getAccountInfo(mintPk);

        const userBalance = await getUserBalanceByAta(connection, {
          mintPubkey: mintPk,
          tokenProgram: mintInfo?.owner,
          userPubkey: userPk
        });
        console.log(123);
        console.log(`Fetched ${type} balance for user ${userBalance}:`);

        if (!cancelledRef.current) {
          setBalanceState(userBalance);
          setActiveType(type);
        }
      } catch (error) {
        console.error("Failed to fetch token balance", error);
        if (!cancelledRef.current) {
          setBalanceState(null);
        }
        throw error;
      } finally {
        if (!cancelledRef.current) {
          setIsLoading(false);
        }
      }
    },
    [program, vaultId, type]
  );

  return {
    balanceState,
    isLoading,
    refetch: fetchBalance,
    activeType
  };
};

export function useAssetMintPubkey() {
  const [assetMintPk, setAssetMintPk] = useState<PublicKey | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const program = useProgram();

  const fetchAssetMintPubkey = useCallback(
    async ({ vaultId }) => {
      setIsLoading(true);
      try {
        const connection = program.provider.connection;
        const vaultState = await getVaultStateById(program, vaultId);
        const assetVaultPk = vaultState.assetVault;
        console.log("Fetching asset mint pubkey for vaultId:", vaultId);

        const assetVaultAccountInfo =
          await connection.getAccountInfo(assetVaultPk);
        if (!assetVaultAccountInfo) {
          throw new Error("Failed to fetch asset vault account");
        }

        const assetTokenProgram = assetVaultAccountInfo.owner;

        const assetVault = await getAccount(
          connection,
          assetVaultPk,
          connection.commitment,
          assetTokenProgram
        );

        const mintPk = assetVault.mint;
        setAssetMintPk(mintPk);
        return mintPk;
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        setAssetMintPk(null);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [program]
  );

  return {
    assetMintPk,
    isLoading,
    fetchAssetMintPubkey
  };
}

export const useConvertToAssets = ({ vaultId }: { vaultId: number }) => {
  const vault = useVault(vaultId);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [assets, setAssets] = useState<BN | null>(null);
  const { accounts } = useGetNavProviderAccounts({ vaultId });

  const convertToAssets = useCallback(
    async (shares: number | BN): Promise<BN | null> => {
      if (!vault.config || !accounts) return null;

      const { config } = vault;
      const program = config.program;
      setIsLoading(true);
      setError(null);

      try {
        const navProviderAccounts = [...accounts];

        const roundingArg = { floor: {} };

        const assets = await program.methods
          .convertToAssets(new BN(shares), roundingArg)
          .accountsPartial({
            vaultState: config.statePubkey,
            assetMint: config.assetMintPubkey,
            assetVault: config.assetVaultPubkey,
            shareMint: config.shareMintPubkey,
            liquidationTokenMint: config.liquidationConfig?.mintPubkey! ?? null,
            liquidationTokenVault: config.liquidationTokenVaultPubkey!
          })
          .remainingAccounts(navProviderAccounts)
          .view();
        setAssets(assets);
        return assets;
      } catch (err) {
        const e = err instanceof Error ? err : new Error(String(err));
        setError(e);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [vault, accounts]
  );

  return {
    assets,
    convertToAssets,
    isLoading,
    error
  };
};

export const useConvertToShares = ({ vaultId }: { vaultId: number }) => {
  const vault = useVault(vaultId);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [assets, setAssets] = useState<BN | null>(null);

  const convertToShares = useCallback(
    async (shares: number | BN): Promise<BN | null> => {
      if (!vault.config) return null;

      const { config } = vault;
      const program = config.program;
      setIsLoading(true);
      setError(null);

      try {
        const navProviderAccounts = [
          { pubkey: PublicKey.default, isSigner: false, isWritable: false }
        ];

        const roundingArg = { floor: {} };

        const assets = await program.methods
          .convertToShares(new BN(shares), roundingArg)
          .accountsPartial({
            vaultState: config.statePubkey,
            assetMint: config.assetMintPubkey,
            assetVault: config.assetVaultPubkey,
            shareMint: config.shareMintPubkey,
            liquidationTokenMint: config.liquidationConfig?.mintPubkey! ?? null,
            liquidationTokenVault: config.liquidationTokenVaultPubkey!
          })
          .remainingAccounts(navProviderAccounts)
          .view();
        setAssets(assets);
        return assets;
      } catch (err) {
        const e = err instanceof Error ? err : new Error(String(err));
        setError(e);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [vault]
  );

  return {
    assets,
    convertToShares,
    isLoading,
    error
  };
};

export function useAssetTokenDecimal() {
  const program = useProgram();
  const connection = program.provider.connection;

  const [decimals, setDecimals] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchDecimals = useCallback(
    async ({ vaultId }) => {
      setLoading(true);

      try {
        const vaultState = await getVaultStateById(program, vaultId);

        const assetVaultInfo = await connection.getAccountInfo(
          vaultState.assetVault
        );
        const assetTokenProgram = assetVaultInfo?.owner;

        const assetVaultPubkey = new PublicKey(vaultState.assetVault);
        const assetVault = await getAccount(
          connection,
          assetVaultPubkey,
          connection.commitment,
          assetTokenProgram
        );

        const assetMintPk = assetVault.mint;

        const mintInfo = await getMint(
          connection,
          assetMintPk,
          connection.commitment,
          assetTokenProgram
        );

        setDecimals(mintInfo.decimals);
        return mintInfo.decimals;
      } catch (err) {
        const e = err instanceof Error ? err : new Error(String(err));

        throw e;
      } finally {
        setLoading(false);
      }
    },
    [connection, program]
  );

  return { decimals, isLoading: loading, fetchDecimals };
}

export const useGetShareValue = ({ vaultId }: { vaultId: number }) => {
  const vault = useVault(vaultId);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [value, setValue] = useState<BN | null>(null);

  const getShareValue = useCallback(async () => {
    if (!vault.config) return null;

    const { config } = vault;
    const program = config.program;
    setIsLoading(true);
    setError(null);

    try {
      const navProviderAccounts = [
        { pubkey: PublicKey.default, isSigner: false, isWritable: false }
      ];

      const assets = await program.methods
        .getShareValue()
        .accountsPartial({
          vaultState: config.statePubkey,
          assetMint: config.assetMintPubkey,
          assetVault: config.assetVaultPubkey,
          shareMint: config.shareMintPubkey,
          liquidationTokenMint: config.liquidationConfig?.mintPubkey! ?? null,
          liquidationTokenVault: config.liquidationTokenVaultPubkey!
        })
        .remainingAccounts(navProviderAccounts)
        .view();
      setValue(assets);
      return assets;
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [vault]);

  return {
    value,
    execute: getShareValue,
    isLoading,
    error
  };
};

export const useGetTotalAssets = ({ vaultId }: { vaultId: number }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [value, setValue] = useState<string | null>(null);

  const program = useProgram();

  const getTotalAssets = useCallback(async () => {
    if (!program) return null;

    setIsLoading(true);
    setError(null);

    try {
      const vaultState = await getVaultStateById(program, vaultId);
      const assetVaultPk = vaultState.assetVault;
      const assetVaultInfo =
        await program.provider.connection.getAccountInfo(assetVaultPk);
      const assetTokenProgram = assetVaultInfo?.owner;
      const assetVault = await getAccount(
        program.provider.connection,
        assetVaultPk,
        program.provider.connection.commitment,
        assetTokenProgram
      );

      setValue(assetVault.amount.toString());
      return assetVault.amount;
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [program, vaultId]);

  return {
    value,
    execute: getTotalAssets,
    isLoading,
    error
  };
};
export const useVaultState = ({ vaultId }: { vaultId: number }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [value, setValue] = useState<
    (VaultState & { LiquidationConfig: LiquidationConfig }) | null
  >(null);

  const program = useProgram();

  const getVaultState = useCallback(async () => {
    if (!program) return null;

    setIsLoading(true);
    setError(null);

    try {
      const connection = program.provider.connection;
      const vaultState = await getVaultStateById(program, vaultId);

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

      setValue({ ...vaultState, liquidationConfig });
      return vaultState;
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [program, vaultId]);

  return {
    value,
    execute: getVaultState,
    isLoading,
    error
  };
};
