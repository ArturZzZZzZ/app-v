import React from "react";

import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Container,
  Paper,
  Snackbar,
  Tab,
  Tabs,
  TextField,
  Typography
} from "@mui/material";

/**
 * Presentational component for Vault administration.
 * All business logic (e.g., blockchain interactions) should be handled by parent components.
 */
const VaultAdminUI = ({
  activeTab,
  onTabChange,
  inputValue,
  onInputChange,
  onAction,
  loading,
  snackbar,
  onCloseSnackbar,
  setAction,
  getButtonText
}) => (
  <Container maxWidth="sm" sx={{ mt: 4 }}>
    <Paper elevation={3} sx={{ p: 2 }}>
      <Tabs value={activeTab} onChange={onTabChange} centered>
        <Tab label="Add Redeemer" onClick={() => setAction("Add Redeemer")} />
        <Tab label="Change Admin" onClick={() => setAction("Change Admin")} />
        <Tab
          label="Add Liquidator"
          onClick={() => setAction("Add Liquidator")}
        />
      </Tabs>
      <Box sx={{ mt: 3 }}>
        <TextField
          label={
            activeTab === 0
              ? "Redeemer Wallet Address"
              : activeTab === 1
                ? "New Admin Wallet Address"
                : "Liquidator Wallet Address"
          }
          value={inputValue}
          onChange={onInputChange}
          fullWidth
          required
          disabled={loading}
        />
        <Button
          variant="contained"
          color="primary"
          onClick={onAction}
          disabled={loading || !inputValue}
          fullWidth
          sx={{ mt: 2 }}
        >
          {loading && (
            <CircularProgress size={24} sx={{ color: "inherit", mr: 2 }} />
          )}
          {getButtonText()}
        </Button>
      </Box>
    </Paper>
    <Snackbar
      open={snackbar.open}
      autoHideDuration={6000}
      onClose={onCloseSnackbar}
    >
      <Alert severity={snackbar.severity} sx={{ width: "100%" }}>
        {snackbar.message}
      </Alert>
    </Snackbar>
  </Container>
);

export default VaultAdminUI;
