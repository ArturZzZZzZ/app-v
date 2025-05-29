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

import { Asset } from "./SecuritizeCreditVault/solanaSmartContractInterface/read/Asset";
import { BalanceOf } from "./SecuritizeCreditVault/solanaSmartContractInterface/read/BalanceOf";
import { ConvertToAssets } from "./SecuritizeCreditVault/solanaSmartContractInterface/read/ConverToAssets";
import { ConvertToShares } from "./SecuritizeCreditVault/solanaSmartContractInterface/read/ConverToShares";
import { Decimal } from "./SecuritizeCreditVault/solanaSmartContractInterface/read/Decimal";
import { GetShareValue } from "./SecuritizeCreditVault/solanaSmartContractInterface/read/GetShareValue";
import { GetTotalAssets } from "./SecuritizeCreditVault/solanaSmartContractInterface/read/GetTotalAssets";
import { LiquidationOpenToPublic } from "./SecuritizeCreditVault/solanaSmartContractInterface/read/LiquidationOpenToPublic";
import { LiquidationToken } from "./SecuritizeCreditVault/solanaSmartContractInterface/read/LiquidationToken";
import { Paused } from "./SecuritizeCreditVault/solanaSmartContractInterface/read/Paused";
import { Redemption } from "./SecuritizeCreditVault/solanaSmartContractInterface/read/Redemption";
import { Role } from "./SecuritizeCreditVault/solanaSmartContractInterface/read/Role";
import { AddLiquidator } from "./SecuritizeCreditVault/solanaSmartContractInterface/write/AddLiquidator2";
import { AddRedeemer } from "./SecuritizeCreditVault/solanaSmartContractInterface/write/AddRedeemer2";
import { ChangeAdmin } from "./SecuritizeCreditVault/solanaSmartContractInterface/write/ChangeAdmin";
import { Deposit } from "./SecuritizeCreditVault/solanaSmartContractInterface/write/Deposit";
import { Liquidate } from "./SecuritizeCreditVault/solanaSmartContractInterface/write/Liquidate";
import { OnPause } from "./SecuritizeCreditVault/solanaSmartContractInterface/write/OnPause copy";
import { Redeem } from "./SecuritizeCreditVault/solanaSmartContractInterface/write/Redeem";
import { RevokeLiquidator } from "./SecuritizeCreditVault/solanaSmartContractInterface/write/RevokeLiquidator";
import { RevokeRedeemer } from "./SecuritizeCreditVault/solanaSmartContractInterface/write/RevokeRedeemer";
import { SetLiquidationOpenToPublic } from "./SecuritizeCreditVault/solanaSmartContractInterface/write/SetLiquidationOpenToPublic";
import { UnPause } from "./SecuritizeCreditVault/solanaSmartContractInterface/write/UnPause";
import { UpdateNavProvider } from "./SecuritizeCreditVault/solanaSmartContractInterface/write/UpdateNavProvider";

export const SmartContractInterfaceContainer: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [, setExpanded] = useState<string | false>(false);
  console.log({ tabValue });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "info" as "info" | "success" | "error"
  });
  const isReadMethods = tabValue === 0;
  const isWriteMethods = tabValue === 1;

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    setExpanded(false);
  };

  //   const handlePanelChange = (panel: string | false) => {
  //     setExpanded(panel);
  //   };

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
          {isReadMethods && (
            <>
              <BalanceOf setSnackbar={setSnackbar} />
              <Asset setSnackbar={setSnackbar} />
              <ConvertToAssets setSnackbar={setSnackbar} />
              <ConvertToShares setSnackbar={setSnackbar} />
              <Decimal setSnackbar={setSnackbar} />
              <GetShareValue setSnackbar={setSnackbar} />
              <GetTotalAssets setSnackbar={setSnackbar} />
              <Role setSnackbar={setSnackbar} role="isAdmin" />
              <Role setSnackbar={setSnackbar} role="isLiquidator" />
              <Role setSnackbar={setSnackbar} role="isOperator" />
              <LiquidationOpenToPublic setSnackbar={setSnackbar} />
              <LiquidationToken setSnackbar={setSnackbar} />
              <Paused setSnackbar={setSnackbar} />
              <Redemption setSnackbar={setSnackbar} />
            </>
          )}
          {isWriteMethods && (
            <>
              <AddLiquidator setSnackbar={setSnackbar} />
              <AddRedeemer setSnackbar={setSnackbar} />
              <ChangeAdmin setSnackbar={setSnackbar} />
              <Deposit setSnackbar={setSnackbar} />
              <Liquidate setSnackbar={setSnackbar} />
              <Redeem setSnackbar={setSnackbar} />
              <OnPause setSnackbar={setSnackbar} />
              <UnPause setSnackbar={setSnackbar} />
              <SetLiquidationOpenToPublic setSnackbar={setSnackbar} />
              <UpdateNavProvider setSnackbar={setSnackbar} />
              <RevokeLiquidator setSnackbar={setSnackbar} />
              <RevokeRedeemer setSnackbar={setSnackbar} />
            </>
          )}
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
