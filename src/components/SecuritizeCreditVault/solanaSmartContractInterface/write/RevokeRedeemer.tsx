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

import { useAppContext } from "@/utils/AppContext";
import { useRevokeRedeemer } from "@/utils/writeMehods";

export const RevokeRedeemer = ({ setSnackbar }) => {
  const [inputValue, setInputValue] = useState("");
  const methodName = "revokeRedeemer";

  const ctx = useAppContext();
  const vaultId = ctx.selectedAsset.solanaVaultId;
  const { execute, loading: isLoading, value } = useRevokeRedeemer(vaultId);

  const handler = () => {
    if (!inputValue) {
      return;
    }
    setSnackbar({
      open: true,
      message: `Executing ${methodName}`,
      severity: "info"
    });
    execute(inputValue)
      .then(() => {
        setSnackbar({
          open: true,
          message: `Executed ${methodName}`,
          severity: "success"
        });
      })
      .catch((error) => {
        setSnackbar({
          open: true,
          message: `Error executing ${methodName}: ${error.message}`,
          severity: "error"
        });
      });
  };
  return (
    <Accordion>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Typography>{methodName}</Typography>
      </AccordionSummary>
      <AccordionDetails>
        <Box>
          <TextField
            label={`address`}
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
              `Execute ${methodName}`
            )}
          </Button>
          {value && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="body1">
                <strong>Execution Result:</strong>
              </Typography>
              <Paper
                elevation={1}
                sx={{ p: 2, mt: 1, backgroundColor: "#f5f5f5" }}
              >
                <Typography
                  variant="body2"
                  sx={{ whiteSpace: "pre-wrap", fontSize: "13px" }}
                >
                  {value}
                </Typography>
              </Paper>
            </Box>
          )}
        </Box>
      </AccordionDetails>
    </Accordion>
  );
};
