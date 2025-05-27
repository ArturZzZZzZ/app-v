import React, { useState } from "react";

import { useAppContext } from "../utils/AppContext";
import { useAddLiquidator } from "../utils/anchorHelpers";
import VaultAdminUI from "./ui/VaultAdminUI";

// import VaultAdminUI from "./ui/VaultAdminUI";

export const VaultAdminContainer = () => {
  const [action, setAction] = useState("Add Redeemer");
  const [step, setStep] = useState(0);
  const [activeTab, setActiveTab] = useState(0);
  const [inputValue, setInputValue] = useState("");
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "info"
  });

  const ctx = useAppContext();
  const selectedAsset = ctx.selectedAsset;
  const assetSymbol = selectedAsset.assetSymbol;
  const vaultId = ctx.solanaVaultId;

  const { addLiquidator, loading: isLoadingAddLiquidator } =
    useAddLiquidator(vaultId);

  const isLoading = isLoadingAddLiquidator;

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

  const onTabChange = (event, newValue) => {
    setActiveTab(newValue);
    setInputValue("");
  };

  const onInputChange = (event) => {
    setInputValue(event.target.value);
  };

  const handleAddLiquidator = async () => {
    console.log("handleAddLiquidator");
    setStep(2);
    addLiquidator(inputValue)
      .then((hash) => {
        setSnackbar({
          open: true,
          message: "Transaction successful: " + hash,
          severity: "success"
        });
        setStep(1);
        setInputValue("");
      })
      .catch((error) => {
        console.error("Transaction error1111111:", error);
        setStep(1);
        setSnackbar({
          open: true,
          message: error.message || "Transaction failed",
          severity: "error"
        });
      })
      .finally(() => {
        setStep(1);
      });
  };

  const onAction = () => {
    if (!inputValue) return;
    const activeAction =
      activeTab === 0
        ? "Add Redeemer"
        : activeTab === 1
          ? "Change Admin"
          : handleAddLiquidator;
    activeAction();
  };

  const onCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <VaultAdminUI
      setAction={setAction}
      activeTab={activeTab}
      onTabChange={onTabChange}
      inputValue={inputValue}
      onInputChange={onInputChange}
      onAction={onAction}
      loading={isLoading}
      snackbar={snackbar}
      onCloseSnackbar={onCloseSnackbar}
      getButtonText={getButtonText}
    />
  );
};
