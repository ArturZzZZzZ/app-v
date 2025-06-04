import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  CircularProgress,
  Paper,
  Typography
} from "@mui/material";

import { useAppContext } from "@/utils/AppContext";
import { useAssetTokenDecimal } from "@/utils/readMethods";

export const Decimal = ({ setSnackbar }) => {
  const ctx = useAppContext();
  const vaultId = ctx.selectedAsset.solanaVaultId;
  const methodName = "decimal";

  const { decimals, fetchDecimals, isLoading } = useAssetTokenDecimal({
    vaultId
  });
  const handler = () => {
    setSnackbar({
      open: true,
      message: `Executing ${methodName}...`,
      severity: "info"
    });
    fetchDecimals()
      .then(() => {
        setSnackbar({
          open: true,
          message: `Executed ${methodName} `,
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
          {decimals && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="body1">
                <strong>Execution Result:</strong>
              </Typography>
              <Paper
                elevation={1}
                sx={{ p: 2, mt: 1, backgroundColor: "#f5f5f5" }}
              >
                <Typography variant="body2" sx={{ whiteSpace: "pre-wrap" }}>
                  {decimals.toString()}
                </Typography>
              </Paper>
            </Box>
          )}
        </Box>
      </AccordionDetails>
    </Accordion>
  );
};
