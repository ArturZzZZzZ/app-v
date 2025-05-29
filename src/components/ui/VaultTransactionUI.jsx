import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Container,
  Paper,
  Snackbar,
  Stack,
  TextField
} from "@mui/material";

function VaultTransactionUI({
  assets,
  setAssets,
  action,
  setAction,
  loading,
  handleTransaction,
  getButtonText,
  snackbarOpen,
  snackbarMessage,
  snackbarSeverity,
  handleSnackbarClose,
  maxAssets,
  tokenSymbol
}) {
  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <Paper elevation={3} sx={{ padding: "12px" }}>
        <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
          <Chip
            label="Deposit"
            color={action === "deposit" ? "primary" : "default"}
            onClick={() => setAction("deposit")}
            disabled={loading}
          />
          <Chip
            label="Redeem"
            color={action === "redeem" ? "primary" : "default"}
            onClick={() => setAction("redeem")}
            disabled={loading}
          />
          <Chip
            label="Liquidate"
            color={action === "liquidate" ? "primary" : "default"}
            onClick={() => setAction("liquidate")}
            disabled={loading}
          />
        </Stack>
        <Box
          component="form"
          sx={{ display: "flex", flexDirection: "column", gap: 2 }}
        >
          <TextField
            label={`Assets to ${action}`}
            type="number"
            value={assets}
            onChange={(e) => setAssets(parseFloat(e.target.value))}
            onKeyDown={(e) => e.key === "Enter" && e.preventDefault()}
            fullWidth
            required
            disabled={loading}
            inputProps={{ min: 0, max: maxAssets }}
          />
          <span>
            {tokenSymbol} Balance: -{" "}
            {parseFloat(maxAssets).toLocaleString("en-US", {
              style: "decimal"
            })}
          </span>
          <Button
            variant="contained"
            color="primary"
            onClick={handleTransaction}
            disabled={loading || !assets || isNaN(assets) || assets <= 0}
            fullWidth
          >
            {loading ? (
              <>
                <CircularProgress size={24} sx={{ color: "inherit", mr: 2 }} />
                {getButtonText()}
              </>
            ) : (
              getButtonText()
            )}
          </Button>
        </Box>
      </Paper>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbarSeverity}
          sx={{ width: "100%" }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
}

export default VaultTransactionUI;
