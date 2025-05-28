import { useState } from "react";

import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  CircularProgress,
  Paper,
  TextField,
  Typography
} from "@mui/material";
import { PublicKey } from "@solana/web3.js";

import { useAppContext } from "@/utils/AppContext";
import { useTokenBalanceStateByAddress } from "@/utils/readMethods";

export const BalanceOf = ({ setSnackbar }) => {
  const [inputValue, setInputValue] = useState("");

  const ctx = useAppContext();
  const vaultId = ctx.solanaVaultId;

  const { balanceState, isLoading, refetch } = useTokenBalanceStateByAddress({
    vaultId: vaultId,
    type: "deposit"
  });
  const handler = () => {
    refetch(inputValue)
      .then(() => {
        setSnackbar({
          open: true,
          message: `Executed balanceOf for ${inputValue}`,
          severity: "success"
        });
      })
      .catch((error) => {
        setSnackbar({
          open: true,
          message: `Error executing balanceOf: ${error.message}`,
          severity: "error"
        });
      });
  };
  return (
    <Accordion>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Typography>balanceOf</Typography>
      </AccordionSummary>
      <AccordionDetails>
        <Box>
          <TextField
            label={`account (address)`}
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.target.value);
            }}
            fullWidth
            required
            disabled={isLoading}
            sx={{ mb: 2 }}
          />
          <Button
            variant="contained"
            color="primary"
            onClick={handler}
            disabled={isLoading}
            fullWidth
          >
            {isLoading ? (
              <CircularProgress size={24} sx={{ color: "inherit", mr: 2 }} />
            ) : (
              `Execute balanceOf`
            )}
          </Button>
          {balanceState && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="body1">
                <strong>Execution Result:</strong>
              </Typography>
              <Paper
                elevation={1}
                sx={{ p: 2, mt: 1, backgroundColor: "#f5f5f5" }}
              >
                <Typography variant="body2" sx={{ whiteSpace: "pre-wrap" }}>
                  {balanceState.amount}
                </Typography>
              </Paper>
            </Box>
          )}
        </Box>
      </AccordionDetails>
    </Accordion>
  );
};
