import React, { useEffect, useState } from "react";

import { useGetNavProviderAccounts } from "@/api/solana/helpers";

import { useAppContext } from "../utils/AppContext";
import {
  useDeposit,
  useLiquidate,
  useRedeem,
  useTokenBalanceState
} from "../utils/anchorHelpers";
import VaultTransactionUI from "./ui/VaultTransactionUI";

export const VaultSolanaTransactionContainer = () => {
  useGetNavProviderAccounts({ vaultId: 1 });
  const [assets, setAssets] = useState(0);
  const [action, setAction] = useState<"deposit" | "redeem" | "liquidate">(
    "deposit"
  );
  const [maxAssets, setMaxAssets] = useState(0);
  const [step, setStep] = useState(0);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("info");

  const ctx = useAppContext();
  const selectedAsset = ctx.selectedAsset;
  const assetSymbol = selectedAsset.assetSymbol;
  const vaultId = selectedAsset.solanaVaultId;

  const { onDeposit, loading: isLoadingDeposit } = useDeposit({
    vaultId
  });
  const { onRedeem, loading: isLoadingRedeem } = useRedeem({
    vaultId
  });

  const { onLiquidate, loading: isLoadingLiquidate } = useLiquidate({
    vaultId
  });

  const { balanceState, refetch, activeType } = useTokenBalanceState({
    vaultId,
    type: action
  });

  const isCorrectType = action === activeType;

  useEffect(() => {
    if (action !== activeType) {
      setMaxAssets(0);
    }
  }, [action, activeType, vaultId]);

  useEffect(() => {
    if ((balanceState as any) == 0) {
      setMaxAssets(0);
    }
    if (balanceState) {
      setMaxAssets(Number(balanceState.uiAmountString));
    }
  }, [action, activeType, balanceState]);

  const isLoading = isLoadingDeposit || isLoadingRedeem || isLoadingLiquidate;

  const getButtonText = () => {
    switch (step) {
      case 1:
        return action;
      case 2:
        return "Processing...";
      case 3:
        return "Confirmed";
      default:
        return action.charAt(0).toUpperCase() + action.slice(1);
    }
  };

  const handleDepositTransaction = async () => {
    console.log("Deposit");
    setStep(2);
    onDeposit(assets)
      .then((hash) => {
        setSnackbarMessage("Transaction successful: " + hash);
        setSnackbarSeverity("success");
        setStep(1);
        setAssets(0);
      })
      .catch((error) => {
        console.error("Transaction error:", error);
        setSnackbarMessage(error.message || "Transaction failed");
        setSnackbarSeverity("error");
      })
      .finally(() => {
        setSnackbarOpen(true);
        setStep(1);
        refetch();
      });
  };

  const handleRedeemTransaction = async () => {
    setStep(2);
    onRedeem(assets)
      .then((hash) => {
        setSnackbarMessage("Transaction successful: " + hash);
        setSnackbarSeverity("success");
        setAssets(0);
      })
      .catch((error) => {
        console.error("Transaction error:", error);
        setSnackbarMessage(error.message || "Transaction failed");
        setSnackbarSeverity("error");
      })
      .finally(() => {
        setStep(1);
        setSnackbarOpen(true);
        refetch();
      });
  };

  const handleLiquidateTransaction = async () => {
    setStep(2);
    onLiquidate(assets)
      .then((hash) => {
        setSnackbarMessage("Transaction successful: " + hash);
        setSnackbarSeverity("success");
        setAssets(0);
      })
      .catch((error) => {
        console.error("Transaction error:", error);
        setSnackbarMessage(error.message || "Transaction failed");
        setSnackbarSeverity("error");
      })
      .finally(() => {
        setStep(1);
        setSnackbarOpen(true);
        refetch();
      });
  };

  const handleTransaction = async () => {
    switch (action) {
      case "deposit":
        await handleDepositTransaction();
        break;
      case "redeem":
        await handleRedeemTransaction();
        break;
      case "liquidate":
        await handleLiquidateTransaction();
        break;
      default:
        break;
    }
  };

  const handleSnackbarClose = () => setSnackbarOpen(false);

  return (
    <VaultTransactionUI
      assets={assets}
      setAssets={setAssets}
      action={action}
      setAction={setAction}
      loading={isLoading}
      handleTransaction={handleTransaction}
      getButtonText={getButtonText}
      snackbarOpen={snackbarOpen}
      snackbarMessage={snackbarMessage}
      snackbarSeverity={snackbarSeverity}
      handleSnackbarClose={handleSnackbarClose}
      maxAssets={isCorrectType ? maxAssets : 0}
      tokenSymbol={
        action === "deposit"
          ? assetSymbol
          : selectedAsset.representationTokenName || assetSymbol
      }
    />
  );
};
