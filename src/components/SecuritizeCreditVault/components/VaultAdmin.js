// import { VaultAddress, AssetAddress } from '../../../utils/globals';
import { VaultABI } from '../../../utils/ABIs';
import React, { useState, useEffect } from 'react';
import { Container, Paper, Typography, Box, TextField, Button, CircularProgress, Snackbar, Alert, Tabs, Tab } from '@mui/material';
import { useWeb3ModalProvider, useWeb3ModalAccount } from '@web3modal/ethers/react';
import { ethers } from 'ethers';
import { useAppContext } from '../../../utils/AppContext'; // Import AppContext.js

const VaultAdmin = () => {
    const { walletProvider } = useWeb3ModalProvider();
    const [loading, setLoading] = useState(false);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
    const [activeTab, setActiveTab] = useState(0);
    const [inputValue, setInputValue] = useState('');

    const { vaultAddress, setVaultAddress } = useAppContext();
    const { vaultAssetAddress, setVaultAssetAddress } = useAppContext();
    const { TargetBlockchainChainId, setTargetBlockchainChainId } = useAppContext();
    const AssetAddress = vaultAssetAddress;
    const VaultAddress = vaultAddress;

    const handleAction = async (action) => {
        if (!inputValue) {
            setSnackbar({ open: true, message: 'Please enter a valid wallet address.', severity: 'warning' });
            return;
        }

        setLoading(true);
        setSnackbar({ open: true, message: `${action} in progress...`, severity: 'info' });

        try {
            const ethersProvider = new ethers.BrowserProvider(walletProvider);
            const signer = await ethersProvider.getSigner();
            const vaultContract = new ethers.Contract(VaultAddress, VaultABI, signer);
            const tx = await vaultContract[action](inputValue);
            await tx.wait();
            setSnackbar({ open: true, message: `${action} completed successfully!`, severity: 'success' });
            setInputValue(''); // Reset input field
        } catch (error) {
            console.error(`Failed to ${action.toLowerCase()}:`, error);
            setSnackbar({ open: true, message: `Error: ${error.message || 'Transaction failed.'}`, severity: 'error' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container maxWidth="sm" sx={{ mt: 4 }}>
            <Paper elevation={3} sx={{ p: '12px' }}>
                {/* <Typography variant="h5" gutterBottom>
                    Vault Administration
                </Typography> */}
                <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)} centered>
                    <Tab label="Add Redeemer" />
                    <Tab label="Change Admin" />
                    <Tab label="Add Liquidator" />
                </Tabs>
                <Box sx={{ mt: 3 }}>
                    <TextField
                        label={
                            activeTab === 0
                                ? 'Redeemer Wallet Address'
                                : activeTab === 1
                                ? 'New Admin Wallet Address'
                                : 'Liquidator Wallet Address'
                        }
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        fullWidth
                        required
                        disabled={loading}
                    />
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={() =>
                            handleAction(
                                activeTab === 0
                                    ? 'addRedeemer'
                                    : activeTab === 1
                                    ? 'changeAdmin'
                                    : 'addLiquidator'
                            )
                        }
                        disabled={loading || !inputValue}
                        fullWidth
                        sx={{ mt: 2 }}
                    >
                        {loading ? <CircularProgress size={24} sx={{ color: 'inherit', mr: 2 }} /> : null}
                        {activeTab === 0 ? 'Add Redeemer' : activeTab === 1 ? 'Change Admin' : 'Add Liquidator'}
                    </Button>
                </Box>
            </Paper>
            <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
            >
                <Alert severity={snackbar.severity} sx={{ width: '100%' }}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Container>
    );
};

export default VaultAdmin;