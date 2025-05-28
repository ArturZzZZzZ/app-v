// SmartContractInterfaceContainer.tsx
import React, { useState } from "react";

import {
  Alert,
  Box,
  Container,
  Paper,
  Snackbar,
  Tab,
  Tabs
} from "@mui/material";

import { useVault } from "@/utils/anchorHelpers";

import { Asset } from "./SecuritizeCreditVault/smartContractInterface/Asset";
import { BalanceOf } from "./SecuritizeCreditVault/smartContractInterface/BalanceOf";
import { ConvertToAssets } from "./SecuritizeCreditVault/smartContractInterface/ConverToAssets";
import { ConvertToShares } from "./SecuritizeCreditVault/smartContractInterface/ConverToShares";
import { Decimal } from "./SecuritizeCreditVault/smartContractInterface/Decimal";

export const SmartContractInterfaceContainer: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [expanded, setExpanded] = useState<string | false>(false);
  const [inputValues, setInputValues] = useState<
    Record<string, Record<string, string>>
  >({});
  const [executionResults, setExecutionResults] = useState<
    Record<string, string>
  >({});
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "info" as "info" | "success" | "error"
  });

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    setExpanded(false);
  };

  const handlePanelChange = (panel: string | false) => {
    setExpanded(panel);
  };

  const handleInputChange = (
    methodName: string,
    inputName: string,
    value: string
  ) => {
    setInputValues((prev) => ({
      ...prev,
      [methodName]: {
        ...prev[methodName],
        [inputName]: value
      }
    }));
  };

  const handleExecute = (method: { name: string }) => {
    setLoading(true);
    setSnackbar({
      open: true,
      message: `Executing ${method.name}...`,
      severity: "info"
    });
    setTimeout(() => {
      setExecutionResults((prev) => ({
        ...prev,
        [method.name]: `Mock result for ${method.name} with inputs ${JSON.stringify(inputValues[method.name])}`
      }));
      setLoading(false);
      setSnackbar({
        open: true,
        message: `${method.name} executed successfully!`,
        severity: "success"
      });
      setInputValues({});
    }, 1000);
  };

  const handleSnackbarClose = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Paper elevation={3} sx={{ p: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange} centered>
          <Tab label="Read Methods" />
          <Tab label="Write Methods" />
        </Tabs>
        <Box mt={3}>
          <BalanceOf setSnackbar={setSnackbar} />
          <Asset setSnackbar={setSnackbar} />
          <ConvertToAssets setSnackbar={setSnackbar} />
          <ConvertToShares setSnackbar={setSnackbar} />
          <Decimal setSnackbar={setSnackbar} />
        </Box>
      </Paper>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
      >
        <Alert severity={snackbar.severity} sx={{ width: "100%" }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};
