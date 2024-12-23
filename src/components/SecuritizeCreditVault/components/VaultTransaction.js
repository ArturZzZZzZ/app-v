import { VaultAddress, AssetAddress, AssetName, RepresentationTokenName } from '../../../utils/globals';
import { VaultABI, ERC20ABI } from '../../../utils/ABIs';
import React, { useState, useEffect } from 'react';
import { Container, Paper, Typography, Box, TextField, Button, CircularProgress, Chip, Stack, Snackbar, Alert } from '@mui/material';
import { useWeb3ModalProvider, useWeb3ModalAccount } from '@web3modal/ethers/react';
import TokenBalance from './TokenBalance'; // Assuming you have a TokenBalance component
import { ethers } from 'ethers';

function VaultTransaction() {
    const { address, isConnected } = useWeb3ModalAccount();
    const { walletProvider } = useWeb3ModalProvider();

    const [assets, setAssets] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [transactionHash, setTransactionHash] = useState('');
    const [maxAssets, setMaxAssets] = useState(0);
    const [step, setStep] = useState(0); // Step tracking
    const [refresh, setRefresh] = useState(false); // Refresh state
    const [action, setAction] = useState('deposit'); // Action state: 'deposit', 'redeem', or 'liquidate'
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarSeverity, setSnackbarSeverity] = useState('info'); // 'info', 'success', 'warning', 'error'

    async function getAssetBalance() {
        setMaxAssets(0);

        if (!isConnected || !walletProvider) {
            console.log('User disconnected');
            return;
        }

        try {
            const ethersProvider = await new ethers.BrowserProvider(walletProvider);
            const signer = await ethersProvider.getSigner();
            const contractAddress = action === 'deposit' ? AssetAddress : VaultAddress;
            const contractABI = action === 'deposit' ? ERC20ABI : VaultABI;
            const assetContract = await new ethers.Contract(contractAddress, contractABI, signer);
            const assetBalance = await assetContract.balanceOf(address);
            return ethers.formatUnits(assetBalance, 6);
        } catch (error) {
            console.log('Failed to fetch balance:', error);
        }
    }

    async function fetchMaxAssets() {
        const balance = await getAssetBalance();
        setMaxAssets(balance);
    }

    useEffect(() => {
        fetchMaxAssets();
    }, [refresh, action]); // Trigger balance fetch when refresh state or action changes

    async function handleTransaction() {
        try {
            setLoading(true);
            setStep(1); // Step 1: Processing transaction
            setTransactionHash('');
            setSnackbarMessage('Transaction started...');
            setSnackbarSeverity('info');
            setSnackbarOpen(true);

            const ethersProvider = new ethers.BrowserProvider(walletProvider);
            await ethersProvider.send("eth_requestAccounts", []);

            const signer = await ethersProvider.getSigner();
            const vaultContract = new ethers.Contract(VaultAddress, VaultABI, signer);
            const numberOfAssets = ethers.parseUnits(assets.toString(), 6); // Convert assets to BigInt

            if (action === 'deposit') {
                const tokenContract = new ethers.Contract(AssetAddress, ERC20ABI, signer);
                const approveTx = await tokenContract.approve(VaultAddress, numberOfAssets);
                await approveTx.wait();
                setStep(2); // Step 2: Depositing tokens
                setSnackbarMessage('Tokens approved. Depositing...');
                setSnackbarOpen(true);

                const depositTx = await vaultContract.deposit(numberOfAssets, address);
                setTransactionHash(depositTx.hash);
                await depositTx.wait();
                setSnackbarMessage('Tokens deposited successfully!');
                setSnackbarSeverity('success');
            } else if (action === 'redeem') {
                const redeemTx = await vaultContract.redeem(numberOfAssets, address, address);
                setTransactionHash(redeemTx.hash);
                await redeemTx.wait();
                setSnackbarMessage('Tokens redeemed successfully!');
                setSnackbarSeverity('success');
            } else if (action === 'liquidate') {
                const liquidateTx = await vaultContract.liquidate(numberOfAssets);
                setTransactionHash(liquidateTx.hash);
                await liquidateTx.wait();
                setSnackbarMessage('Assets liquidated successfully!');
                setSnackbarSeverity('success');
            }

            setStep(3); // Step 3: Transaction confirmed

            setRefresh((prev) => !prev); // Toggle the refresh state to re-render TokenBalance components
        } catch (err) {
            setError(err.message || 'An error occurred during the transaction.');
            setSnackbarMessage(`Error: ${err.message || 'Transaction failed.'}`);
            setSnackbarSeverity('error');
            setSnackbarOpen(true);
        } finally {
            setLoading(false);
            setStep(0);
        }
    }

    const getButtonText = () => {
        switch (step) {
            case 1:
                return action === 'deposit' ? 'Approving Tokens...' : action === 'redeem' ? 'Adding Wallet as Redeemer...' : 'Liquidating Assets...';
            case 2:
                return action === 'deposit' ? 'Depositing Tokens...' : action === 'redeem' ? 'Redeeming Tokens...' : 'Liquidating...';
            case 3:
                return 'Transaction Confirmed';
            default:
                return action === 'deposit' ? 'Deposit' : action === 'redeem' ? 'Redeem' : 'Liquidate';
        }
    };

    const handleSnackbarClose = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }
        setSnackbarOpen(false);
    };

    return (
        <Container maxWidth="sm" sx={{ mt: 4 }}>
            <Paper elevation={3} sx={{ padding: '12px' }}>
                {/* <Typography variant="h5" component="h1" gutterBottom>
                    Vault Transaction
                </Typography> */}
                <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                    <Chip
                        label="Deposit"
                        color={action === 'deposit' ? 'primary' : 'default'}
                        onClick={() => setAction('deposit')}
                        disabled={loading} // Disable chip when loading
                    />
                    <Chip
                        label="Redeem"
                        color={action === 'redeem' ? 'primary' : 'default'}
                        onClick={() => setAction('redeem')}
                        disabled={loading} // Disable chip when loading
                    />
                    <Chip
                        label="Liquidate"
                        color={action === 'liquidate' ? 'primary' : 'default'}
                        onClick={() => setAction('liquidate')}
                        disabled={loading} // Disable chip when loading
                    />
                </Stack>
                <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <TextField
                        label={`Assets to ${action === 'deposit' ? 'Deposit' : action === 'redeem' ? 'Redeem' : 'Liquidate'}`}
                        type="number"
                        value={assets}
                        onChange={(e) => setAssets(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                e.preventDefault(); // Prevent the form from submitting
                            }
                        }}
                        fullWidth
                        required
                        disabled={loading} // Disable input when loading
                    />
                    <TokenBalance
                        contractAddress={action === 'deposit' ? AssetAddress : VaultAddress}
                        abi={action === 'deposit' ? ERC20ABI : VaultABI}
                        label={action === 'deposit' ? AssetName : RepresentationTokenName}
                        refresh={refresh} // Pass the refresh state as a prop
                    />
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={handleTransaction}
                        disabled={
                            loading ||
                            !assets ||
                            isNaN(parseFloat(assets)) ||
                            parseFloat(assets) <= 0 ||
                            parseFloat(assets) > parseFloat(maxAssets)
                        }
                        fullWidth
                    >
                        {loading ? (
                            <>
                                <CircularProgress size={24} sx={{ color: 'inherit', mr: 2 }} />
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
                <Alert onClose={handleSnackbarClose} severity={snackbarSeverity} sx={{ width: '100%' }}>
                    {snackbarMessage}
                </Alert>
            </Snackbar>
        </Container>
    );
}

export default VaultTransaction;
