import React, { useState, useEffect } from 'react';
import { Container, Paper, Typography, Box, TextField, Button, CircularProgress, Snackbar, Alert, Accordion, AccordionSummary, AccordionDetails, Tabs, Tab } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useWeb3ModalProvider, useWeb3ModalAccount } from '@web3modal/ethers/react';
import { ethers } from 'ethers';
import { VaultAddress } from '../../../utils/globals';
import contractAbi from './SecuritizeVaultABI.json'; // Adjust the path to your ABI file

const SmartContractInterface = () => {
    const { isConnected } = useWeb3ModalAccount();
    const { walletProvider } = useWeb3ModalProvider();
    const [contract, setContract] = useState(null);
    const [inputValues, setInputValues] = useState({});
    const [executionResults, setExecutionResults] = useState({});
    const [loading, setLoading] = useState(false);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
    const [expanded, setExpanded] = useState(false);
    const [tabValue, setTabValue] = useState(0);

    useEffect(() => {
        if (isConnected && walletProvider) {
            const loadContract = async () => {
                const ethersProvider = new ethers.BrowserProvider(walletProvider);
                const signer = await ethersProvider.getSigner();
                setContract(new ethers.Contract(VaultAddress, contractAbi.abi, signer)); // Use the imported ABI
            };
            loadContract();
        }
    }, [isConnected, walletProvider]);

    const handleExecute = async (method) => {
        if (!contract) return;

        setLoading(true);
        setSnackbar({ open: true, message: `Executing ${method.name}...`, severity: 'info' });

        try {
            const args = method.inputs.map((input) =>
                input.type.includes('uint') || input.type.includes('int')
                    ? ethers.toBigInt(inputValues[method.name]?.[input.name])
                    : input.type === 'address'
                    ? ethers.getAddress(inputValues[method.name]?.[input.name])
                    : inputValues[method.name]?.[input.name]
            );

            let result;
            if (method.stateMutability === 'view' || method.stateMutability === 'pure') {
                result = await contract[method.name](...args);
            } else {
                const tx = await contract[method.name](...args);
                result = await tx.wait();
            }

            const serializedResult = JSON.stringify(result, (key, value) =>
                typeof value === 'bigint' ? value.toString() : value
            );

            setExecutionResults((prev) => ({ ...prev, [method.name]: serializedResult }));
            setSnackbar({ open: true, message: `${method.name} executed successfully!`, severity: 'success' });
        } catch (error) {
            setSnackbar({ open: true, message: `Error: ${error.message || 'Transaction failed.'}`, severity: 'error' });
        } finally {
            setLoading(false);
            setInputValues({});
        }
    };

    const renderMethodPanel = (method) => (
        <Accordion key={method.name} expanded={expanded === method.name} onChange={() => setExpanded(expanded === method.name ? false : method.name)}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography>{method.name}</Typography>
            </AccordionSummary>
            <AccordionDetails>
                <Box>
                    {method.inputs.map((input) => (
                        <TextField
                            key={input.name}
                            label={`${input.name} (${input.type})`}
                            value={inputValues[method.name]?.[input.name] || ''}
                            onChange={(e) => setInputValues({ ...inputValues, [method.name]: { ...inputValues[method.name], [input.name]: e.target.value } })}
                            fullWidth
                            required
                            disabled={loading}
                            sx={{ mb: 2 }}
                        />
                    ))}
                    <Button variant="contained" color="primary" onClick={() => handleExecute(method)} disabled={loading} fullWidth>
                        {loading ? <CircularProgress size={24} sx={{ color: 'inherit', mr: 2 }} /> : `Execute ${method.name}`}
                    </Button>
                    {executionResults[method.name] && (
                        <Box sx={{ mt: 2 }}>
                            <Typography variant="body1"><strong>Execution Result:</strong></Typography>
                            <Paper elevation={1} sx={{ p: 2, mt: 1, backgroundColor: '#f5f5f5' }}>
                                <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>{executionResults[method.name]}</Typography>
                            </Paper>
                        </Box>
                    )}
                </Box>
            </AccordionDetails>
        </Accordion>
    );

    const readMethods = contractAbi?.abi.filter((method) => method.type === 'function' && (method.stateMutability === 'view' || method.stateMutability === 'pure')) || [];
    const writeMethods = contractAbi?.abi.filter((method) => method.type === 'function' && method.stateMutability !== 'view' && method.stateMutability !== 'pure') || [];

    return (
        <Container maxWidth="md" sx={{ mt: 4 }}>
            <Paper elevation={3} sx={{ p: 3 }}>
                {/* <Typography variant="h5" gutterBottom>Smart Contract Interface</Typography> */}
                <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)} centered>
                    <Tab label="Read Methods" />
                    <Tab label="Write Methods" />
                </Tabs>
                <Box mt={3}>
                    {tabValue === 0 && readMethods.map(renderMethodPanel)}
                    {tabValue === 1 && writeMethods.map(renderMethodPanel)}
                </Box>
            </Paper>
            <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
                <Alert severity={snackbar.severity} sx={{ width: '100%' }}>{snackbar.message}</Alert>
            </Snackbar>
        </Container>
    );
};

export default SmartContractInterface;