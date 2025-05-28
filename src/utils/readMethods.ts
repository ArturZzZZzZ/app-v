import { useCallback, useEffect, useRef, useState } from "react";

import { getAccount } from "@solana/spl-token";
import { PublicKey } from "@solana/web3.js";

import {
  getUserBalanceByAta,
  getVaultStateById,
  useProgram
} from "./anchorHelpers";
import { TokenBalance } from "./type";

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
