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
import { useAssetMintPubkey } from "@/utils/readMethods";

export const Asset = ({ setSnackbar }) => {
  const ctx = useAppContext();
  const vaultId = ctx.solanaVaultId;

  const { assetMintPk, fetchAssetMintPubkey, isLoading } = useAssetMintPubkey();
  const handler = () => {
    setSnackbar({
      open: true,
      message: `Executing assets...`,
      severity: "info"
    });
    fetchAssetMintPubkey({ vaultId })
      .then(() => {
        setSnackbar({
          open: true,
          message: `Executed assets `,
          severity: "success"
        });
      })
      .catch((error) => {
        setSnackbar({
          open: true,
          message: `Error executing assets: ${error.message}`,
          severity: "error"
        });
      });
  };
  return (
    <Accordion>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Typography>assets</Typography>
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
              `Execute Assets`
            )}
          </Button>
          {assetMintPk && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="body1">
                <strong>Execution Result:</strong>
              </Typography>
              <Paper
                elevation={1}
                sx={{ p: 2, mt: 1, backgroundColor: "#f5f5f5" }}
              >
                <Typography variant="body2" sx={{ whiteSpace: "pre-wrap" }}>
                  {assetMintPk.toString()}
                </Typography>
              </Paper>
            </Box>
          )}
        </Box>
      </AccordionDetails>
    </Accordion>
  );
};
