import React, { useState } from "react";

import { useDeposit, useRedeem } from "../utils/anchorHelpers";
import VaultTransactionUI from "./ui/VaultTransactionUI";

export const VaultSolanaTransactionContainer = () => {
  const [assets, setAssets] = useState(0);
  const [action, setAction] = useState("deposit");
  const [maxAssets, setMaxAssets] = useState(1233123);
  const [step, setStep] = useState(0);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("info");
  const { onDeposit, loading: isLoadingDeposit } = useDeposit();
  const { onRedeem, loading: isLoadingRedeem } = useRedeem();

  const isLoading = isLoadingDeposit || isLoadingRedeem;

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
      });
  };

  const handleRedeemTransaction = async () => {
    console.log("Redeem");
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
      step={step}
      loading={isLoading}
      handleTransaction={handleTransaction}
      getButtonText={getButtonText}
      snackbarOpen={snackbarOpen}
      snackbarMessage={snackbarMessage}
      snackbarSeverity={snackbarSeverity}
      handleSnackbarClose={handleSnackbarClose}
      maxAssets={maxAssets}
    />
  );
};
