import React, { useEffect, useState } from 'react';
import { IconButton, Box, Button, Snackbar, Alert, CircularProgress, Container, Paper, Dialog, DialogTitle, DialogContent, Typography, Link, DialogActions } from '@mui/material';
import SwapVertIcon from '@mui/icons-material/SwapVert';
import CryptoInput from './CryptoInput';
import { useWeb3ModalProvider, useWeb3ModalAccount, useDisconnect } from '@web3modal/ethers/react';

import { useSwitchNetwork } from '@web3modal/ethers/react';
import { ethers, Contract } from 'ethers';
import {
    blockchainInfo
} from '../../../utils/globals';

import {
    ERC20ABI,
    BridgeABI,
} from '../../../utils/ABIs';

const Bridge = ({ network1, network2 }) => {
    const [amount, setAmount] = useState(0);
    const [sourceAssetAddress, setSourceAssetAddress] = useState(network1.assets[0].address);
    const [targetAssetAddress, setTargetAssetAddress] = useState(network2.assets[0].address);

    const [sourceAsset, setSourceAsset] = useState(network1.assets[0]);
    const [targetAsset, setTargetAsset] = useState(network2.assets[0]);

    const [sourceAssetBalance, setSourceAssetBalance] = useState(0);
    const [targetAssetBalance, setTargetAssetBalance] = useState(0);
    const [expectedAmount, setExpectedAmount] = useState(0);
    const [isSwitched, setIsSwitched] = useState(false);
    const [isRotated, setIsRotated] = useState(false);
    const [loading, setLoading] = useState(false);  // Add loading state
    const [snackbarOpen, setSnackbarOpen] = useState(false);  // Add Snackbar
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarSeverity, setSnackbarSeverity] = useState('info');  // Snackbar message type
    const [buttonLabelStatus, setButtonLabelStatus] = useState(null);

    const [dialogOpen, setDialogOpen] = useState(false);
    const [txHash, setTxHash] = useState(null);

    const { address, chainId, isConnected } = useWeb3ModalAccount();
    const { walletProvider } = useWeb3ModalProvider();
    const { switchNetwork } = useSwitchNetwork();
    const { disconnect } = useDisconnect();

    const [fromNetwork, setFromNetwork] = useState(network1);
    const [toNetwork, setToNetwork] = useState(network2);

    // Snackbar handler
    const handleSnackbarClose = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }
        setSnackbarOpen(false);
    };

    const handleDialogClose = () => setDialogOpen(false);


    // Function to get token balance
    async function getTokenBalance(network, assetAddress, setBalance) {
        if (!isConnected || !walletProvider) {
            console.log('User disconnected');
            setBalance(0);
            return;
        }
        try {
            console.log("------> Network: ", network);
            const ethersProvider = new ethers.JsonRpcProvider(network.rpcUrl);
            console.log("Ethers Provider: ", ethersProvider);
            const contract = new Contract(assetAddress, ERC20ABI, ethersProvider);
            console.log("Contract: ", contract);
            const tokenBalance = await contract.balanceOf(address);
            console.log("Token Balance: ", tokenBalance);
            const formattedBalance = ethers.formatUnits(tokenBalance, 6);  // Adjust decimals as needed
            console.log("Formatted Balance: ", formattedBalance);
            setBalance(formattedBalance);
        } catch (error) {
            console.error("Failed to fetch balance: ", error);
            setBalance(0);
        }
    }

    // Fetch token balances on load
    useEffect(() => {
        if (fromNetwork?.assets) {
            setSourceAssetAddress(fromNetwork.assets[0].address);
            getTokenBalance(fromNetwork, fromNetwork.assets[0].address, setSourceAssetBalance);
        } else
            setSourceAssetBalance(0);
        if (toNetwork?.assets) {
            setTargetAssetAddress(toNetwork.assets[0].address);
            getTokenBalance(toNetwork, toNetwork.assets[0].address, setTargetAssetBalance);
        } else
            setTargetAssetBalance(0);
    }, [address, isConnected, fromNetwork, toNetwork]);

    // Synchronize amounts after switching or when the amount changes
    useEffect(() => {
        console.log("The blockchain Info: ", blockchainInfo)
        if (!isSwitched) {
            setExpectedAmount(amount);  // When not switched, update expectedAmount with amount
        } else {
            setAmount(expectedAmount);  // When switched, update amount with expectedAmount
        }
    }, [amount, expectedAmount, isSwitched]);

    // Synchronize assets after switching networks
    useEffect(() => {
        console.log("New Netwoks; changing assets: ");
        console.log("From Network: ", fromNetwork);
        console.log("To Network: ", toNetwork);
        if (isSwitched) {
            setSourceAsset(toNetwork.assets[0]);
            setTargetAsset(fromNetwork.assets[0]);
        } else {
            setSourceAsset(fromNetwork.assets[0]);
            setTargetAsset(toNetwork.assets[0]);
        }

    }, [fromNetwork, toNetwork]);

    // Handle transaction
    async function handleTransaction() {
        try {
            setLoading(true);  // Start loading
            setSnackbarMessage('Initiating transaction...');
            setSnackbarSeverity('info');
            setSnackbarOpen(true);

            let contractSourceAddress = fromNetwork.bridgeContractAddress;
            let contractTargetAddress = toNetwork.bridgeContractAddress;
            let sourceChainId = fromNetwork.chainId;
            let targetChainId = toNetwork.chainId;
            let wormholeSourceChainId = fromNetwork.wormholeChainId;
            let wormholeTargetChainId = toNetwork.wormholeChainId;

            if (isSwitched) {
                contractSourceAddress = toNetwork.bridgeContractAddress;
                contractTargetAddress = fromNetwork.bridgeContractAddress;
                sourceChainId = toNetwork.chainId;
                targetChainId = fromNetwork.chainId;
                wormholeSourceChainId = toNetwork.wormholeChainId;
                wormholeTargetChainId = fromNetwork.wormholeChainId;
            }

            // Check and switch network if needed
            if (sourceChainId !== chainId) {
                setButtonLabelStatus("Switching to correct blockchain");
                await switchNetwork(sourceChainId);
            }

            const ethersProvider = await new ethers.BrowserProvider(walletProvider);
            console.log("=========> Ethers Provider: ", ethersProvider);
            await ethersProvider.send("eth_requestAccounts", []);
            const signer = await ethersProvider.getSigner();
            console.log("=========> Signer: ", signer);
            const bridgeContract = await new ethers.Contract(contractSourceAddress, BridgeABI, signer);
            console.log("=========> Bridge Contract: ", bridgeContract);

            setButtonLabelStatus("Quetting quote");
            const numberOfAssets = ethers.parseUnits(amount.toString(), 6);
            console.log("=========> Number of Assets: ", numberOfAssets);
            console.log("=========> Wormhole Target Chain ID: ", wormholeTargetChainId);
            const quote = await bridgeContract.quoteBridge(wormholeTargetChainId);
            console.log("=========> Quote: ", quote);

            setSnackbarMessage('Processing transaction...');
            setSnackbarOpen(true);

            setButtonLabelStatus("Signing bridging transaction");
            const bridgeTx = await bridgeContract.bridgeDSTokens(wormholeTargetChainId, numberOfAssets, {
                value: quote, // Pass the quote value as the payment
            });
            console.log("Bridging Tx: ", bridgeTx);
            setButtonLabelStatus("Bridging - Be patient ...");
            await bridgeTx.wait();

            setSnackbarMessage('Transaction successful!');
            setSnackbarSeverity('success');

            setTxHash(bridgeTx.hash);
            setDialogOpen(true);

        } catch (err) {
            console.error("Transaction failed: ", err);
            setSnackbarMessage(`Error: ${err.message || 'Transaction failed.'}`);
            setSnackbarSeverity('error');
        } finally {
            console.log("FINALLY!");
            console.log("DESESPERAADOS!");

            setLoading(false);  // End loading
            setSnackbarOpen(true);
            setAmount(0);  // Reset the amount after transaction
            if (walletProvider) {
                getTokenBalance(fromNetwork, sourceAssetAddress, setSourceAssetBalance);
                getTokenBalance(toNetwork, targetAssetAddress, setTargetAssetBalance);
            }
            setButtonLabelStatus(null);
        }
    }

    // Handle switching the From and To networks
    const handleSwitch = () => {
        setIsSwitched(!isSwitched);
        setIsRotated(!isRotated);
        setAmount(0);  // Reset amount when switching
        setExpectedAmount(0);
    };

    // Bridge styles for common UI consistency
    const bridgeStyles = {
        container: {
            display: 'flex',
            flexDirection: 'column',
            // padding: 2,
            // backgroundColor: '#2a2d42',
            borderRadius: 2,
            color: '#fff',
            // width: 'fit-content',
            width: '100%',
            maxWidth: '800px',
            margin: 'auto',
            gap: '1em',
            // margin: 'auto'
        },
        typography: {
            fontWeight: 'bold',
            fontSize: '1.5em',
            textAlign: 'left',
            position: 'relative',
            top: '2em',
            left: '0.9em'
        },
        button: {
            top: '-1em',
            backgroundColor: '#1A1B2D',
            color: '#9fa4c4',
            width: '50px',
            height: '50px',
            borderRadius: '50%',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
            transition: 'transform 0.2s ease-in-out',
            '&:hover': { backgroundColor: '#24263B' },
        },
    };

    return (
        <Box sx={bridgeStyles.container}>
            <CryptoInput
                network={isSwitched ? toNetwork.name : fromNetwork.name}
                otherNetwork={isSwitched ? fromNetwork.name : toNetwork.name}
                setNetwork={isSwitched ? setToNetwork : setFromNetwork}
                amount={isSwitched ? expectedAmount : amount}
                balance={isSwitched ? targetAssetBalance : sourceAssetBalance}
                setAmount={isSwitched ? setExpectedAmount : setAmount}
                editable={true}
                label="From:"
                assetSymbol={isSwitched ? toNetwork.assets[0].symbol : fromNetwork.assets[0].symbol}
                assetIcon={isSwitched ? toNetwork.assets[0].icon : fromNetwork.assets[0].icon}
            />

            <Box display="flex" justifyContent="center" marginY={-2} marginBottom={-7}>
                <IconButton
                    onClick={handleSwitch}
                    sx={{
                        ...bridgeStyles.button, // Shared button styles
                        transform: isRotated ? 'rotate(180deg)' : 'rotate(0deg)',
                    }}
                >
                    <SwapVertIcon fontSize="medium" />
                </IconButton>
            </Box>

            <CryptoInput
                network={isSwitched ? fromNetwork.name : toNetwork.name}
                otherNetwork={isSwitched ? toNetwork.name : fromNetwork.name}
                setNetwork={isSwitched ? setFromNetwork : setToNetwork}
                amount={isSwitched ? amount : expectedAmount}
                balance={isSwitched ? sourceAssetBalance : targetAssetBalance}
                setAmount={isSwitched ? setAmount : setExpectedAmount}
                editable={false}
                label="To:"
                assetSymbol={isSwitched ? fromNetwork.assets[0].symbol : toNetwork.assets[0].symbol}
                assetIcon={isSwitched ? fromNetwork.assets[0].icon : toNetwork.assets[0].icon}
            />

            <Button
                fullWidth
                variant="contained"
                onClick={handleTransaction}
                disabled={loading || !amount}
            >
                {loading ? (
                    <>
                        <CircularProgress size={24} sx={{ color: 'inherit', mr: 2 }} />
                        {/* Processing... */}
                        {buttonLabelStatus}
                    </>
                ) : (
                    'Bridge'
                )}
            </Button>

            {/* Snackbar */}
            <Snackbar
                open={snackbarOpen}
                autoHideDuration={6000}
                onClose={handleSnackbarClose}
            >
                <Alert onClose={handleSnackbarClose} severity={snackbarSeverity} sx={{ width: '100%' }}>
                    {snackbarMessage}
                </Alert>
            </Snackbar>

            <Dialog open={dialogOpen} onClose={handleDialogClose}>
                <DialogTitle>Bridging in Progress</DialogTitle>
                <DialogContent>
                    <Typography align='center'>
                        Your transaction is being processed. The bridging process may take some time as it requires confirmation on both the source and destination blockchains. You can monitor the transaction’s status by clicking on the link below to view real-time updates on Wormhole Scan.
                    </Typography>
                    <Typography align='center' variant="body2" sx={{ mt: 1, mb: 3 }}>
                        <Link
                            href={`https://wormholescan.io/#/tx/${txHash}?network=Testnet&view=progress`}
                            target="_blank"
                            rel="noopener"
                        >
                            View transaction status on Wormhole Scan
                        </Link>
                    </Typography>
                    <Typography variant='body2'>
                        Bridging times may vary based on network congestion and blockchain speeds. Please be patient, and rest assured your transaction is underway.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleDialogClose} color="primary">
                        Close
                    </Button>
                </DialogActions>
            </Dialog>

        </Box>
    );
};

export default Bridge;