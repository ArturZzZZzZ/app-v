// SmartContractInterfaceUI.tsx
import React from "react";

import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
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

// Define minimal types for method descriptions
type MethodInput = { name: string; type: string };
type Method = { name: string; inputs: MethodInput[]; stateMutability: string };

interface Props {
  readMethods: Method[];
  writeMethods: Method[];
  tabValue: number;
  onTabChange: (e: React.SyntheticEvent, newValue: number) => void;
  expanded: string | false;
  onPanelChange: (panel: string | false) => void;
  inputValues: Record<string, Record<string, string>>;
  onInputChange: (methodName: string, inputName: string, value: string) => void;
  onExecute: (method: Method) => void;
  loading: boolean;
  executionResults: Record<string, string>;
  snackbar: {
    open: boolean;
    message: string;
    severity: "info" | "success" | "error";
  };
  onSnackbarClose: () => void;
}

export const SmartContractInterfaceUI: React.FC<Props> = ({
  readMethods,
  writeMethods,
  tabValue,
  onTabChange,
  expanded,
  onPanelChange,
  inputValues,
  onInputChange,
  onExecute,
  loading,
  executionResults,
  snackbar,
  onSnackbarClose
}) => (
  <Container maxWidth="md" sx={{ mt: 4 }}>
    <Paper elevation={3} sx={{ p: 3 }}>
      <Tabs value={tabValue} onChange={onTabChange} centered>
        <Tab label="Read Methods" />
        <Tab label="Write Methods" />
      </Tabs>
      <Box mt={3}>
        <Accordion
          //   expanded={expanded === method.name}
          onChange={() =>
            onPanelChange(expanded === method.name ? false : method.name)
          }
        >
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography>{"method.name"}</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Box>
              <TextField
                label={`123 Method Input`}
                value={"123"}
                onChange={(e) => {}}
                fullWidth
                required
                disabled={loading}
                sx={{ mb: 2 }}
              />
              <Button
                variant="contained"
                color="primary"
                onClick={() => onExecute()}
                disabled={loading}
                fullWidth
              >
                {loading ? (
                  <CircularProgress
                    size={24}
                    sx={{ color: "inherit", mr: 2 }}
                  />
                ) : (
                  `Execute method.name123123`
                )}
              </Button>
              {/* {executionResults[method.name] && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="body1">
                    <strong>Execution Result:</strong>
                  </Typography>
                  <Paper
                    elevation={1}
                    sx={{ p: 2, mt: 1, backgroundColor: "#f5f5f5" }}
                  >
                    <Typography variant="body2" sx={{ whiteSpace: "pre-wrap" }}>
                      {executionResults[method.name]}
                    </Typography>
                  </Paper>
                </Box>
              )} */}
            </Box>
          </AccordionDetails>
        </Accordion>
      </Box>
    </Paper>
    <Snackbar
      open={snackbar.open}
      autoHideDuration={6000}
      onClose={onSnackbarClose}
    >
      <Alert severity={snackbar.severity} sx={{ width: "100%" }}>
        {snackbar.message}
      </Alert>
    </Snackbar>
  </Container>
);
