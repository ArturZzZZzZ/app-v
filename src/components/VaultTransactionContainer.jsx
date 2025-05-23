import React, { useState } from "react";

import { useDeposit } from "../utils/anchorHelpers";
import VaultTransactionUI from "./ui/VaultTransactionUI";

export const VaultSolanaTransactionContainer = () => {
  console.log("blockType", "SOLANA");
  const [assets, setAssets] = useState(0);
  const [action, setAction] = useState("deposit");
  const [step, setStep] = useState(0);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("info");
  const { onDeposit, loading: isLoadingDeposit } = useDeposit();

  const maxAssets = 100;

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
    setStep(2);
    onDeposit(assets)
      .then((hash) => {
        setSnackbarMessage("Transaction successful: " + hash);
        setSnackbarSeverity("success");
        setStep(1);
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

  const handleSnackbarClose = () => setSnackbarOpen(false);

  return (
    <VaultTransactionUI
      assets={assets}
      setAssets={setAssets}
      action={action}
      setAction={setAction}
      step={step}
      loading={isLoadingDeposit}
      handleTransaction={handleDepositTransaction}
      getButtonText={getButtonText}
      snackbarOpen={snackbarOpen}
      snackbarMessage={snackbarMessage}
      snackbarSeverity={snackbarSeverity}
      handleSnackbarClose={handleSnackbarClose}
      maxAssets={maxAssets}
    />
  );
};
