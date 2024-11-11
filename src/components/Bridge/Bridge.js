import React, { useEffect, useState } from 'react';
import { IconButton, Box, Button, Snackbar, Alert, CircularProgress } from '@mui/material';
import { useWeb3ModalProvider, useWeb3ModalAccount } from '@web3modal/ethers/react';
import { useSwitchNetwork } from '@web3modal/ethers/react';
import { ethers, Contract, formatUnits } from 'ethers';
import {
    blockchainInfo
} from '../../utils/globals';
import {
    ERC20ABI,
    BridgeABI,
} from '../../utils/ABIs';
import SwapVertIcon from '@mui/icons-material/SwapVert';
import CryptoInput from './components/CryptoInput';
import TransactionProgressDialog from './components/TransactionProgressDialog';
import InsufficientBalanceDialog from './components/InsufficientBalanceDialog';
import bridgeStyles from './styles/bridgeStyles';
import { format, isBefore, isAfter, parseISO } from 'date-fns';
import { formatInTimeZone, toDate } from 'date-fns-tz';
import Holidays from 'date-holidays';
import NotBusinessDayDialog from './components/NotBusinessDayDialog';
import { BRIDGE_PRODUCTION_VERSION } from '../../utils/globals';


const Bridge = ({ network1, network2 }) => {
    // Asset-related states
    const [amount, setAmount] = useState(0);  // Amount to bridge
    const [sourceAssetAddress, setSourceAssetAddress] = useState(network1.assets[0].address);  // Source asset address
    const [targetAssetAddress, setTargetAssetAddress] = useState(network2.assets[0].address);  // Target asset address
    const [sourceAsset, setSourceAsset] = useState(network1.assets[0]);  // Source asset
    const [targetAsset, setTargetAsset] = useState(network2.assets[0]);  // Target asset
    const [sourceAssetBalance, setSourceAssetBalance] = useState(0);  // Balance of source asset
    const [targetAssetBalance, setTargetAssetBalance] = useState(0);  // Balance of target asset
    const [expectedAmount, setExpectedAmount] = useState(0);  // Expected amount to receive after bridging

    // Network-related states
    const [fromNetwork, setFromNetwork] = useState(network1);  // Initial from network
    const [toNetwork, setToNetwork] = useState(network2);  // Initial to network

    // Transaction-related states
    const [quote, setQuote] = useState(0);  // Quote for the transaction
    const [nativeBalance, setNativeBalance] = useState(0);  // Native token balance
    const [txHash, setTxHash] = useState(null);  // Transaction hash
    const [loading, setLoading] = useState(false);  // Loading state for transaction
    const [isSwitched, setIsSwitched] = useState(false);  // State for switching networks

    // Snackbar-related states (feedback messages)
    const [snackbarOpen, setSnackbarOpen] = useState(false);  // Snackbar visibility
    const [snackbarMessage, setSnackbarMessage] = useState('');  // Snackbar message content
    const [snackbarSeverity, setSnackbarSeverity] = useState('info');  // Snackbar message type (e.g., info, error, success)

    // Dialog-related states (UI modals)
    const [dialogOpen, setDialogOpen] = useState(false);  // Transaction progress dialog visibility
    const [balanceDialogOpen, setBalanceDialogOpen] = useState(false);  // Insufficient balance dialog visibility
    const [notBusinessHoursDialogOpen, setNotBusinessHoursDialogOpen] = useState(false);  // Not business hours dialog visibility

    // UI label state
    const [buttonLabelStatus, setButtonLabelStatus] = useState(null);  // Label status for the action button
    const [isRotated, setIsRotated] = useState(false);  // UI state for rotation effect

    // Web3 connection states
    const { address, chainId, isConnected } = useWeb3ModalAccount();  // Account information
    const { walletProvider } = useWeb3ModalProvider();  // Web3 provider
    const { switchNetwork } = useSwitchNetwork();  // Network switcher function


    // Snackbar handler
    const handleSnackbarClose = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }
        setSnackbarOpen(false);
    };

    const handleBalanceDialogClose = () => setBalanceDialogOpen(false); // Close balance dialog
    const handleDialogClose = () => setDialogOpen(false);

    // Function to get the native token balance
    async function getNativeTokenBalance() {
        if (!isConnected || !walletProvider) return;

        try {
            const ethersProvider = new ethers.BrowserProvider(walletProvider);
            const balance = await ethersProvider.getBalance(address);
            setNativeBalance(balance);
            console.log("Native Balance: ", balance);
            console.log("Native Balance: ", formatUnits(balance, 18));
            return balance;
        } catch (error) {
            console.error("Failed to fetch native token balance:", error);
            setNativeBalance(0);
        }
    }

    async function getNativeTokenBalanceWithBackoff(retries = 5, delay = 1000) {
        try {
            return await getNativeTokenBalance();
        } catch (error) {
            if (retries === 0) throw error;
            console.warn(`Retrying in ${delay / 1000} seconds...`);
            await new Promise(resolve => setTimeout(resolve, delay));
            return getNativeTokenBalanceWithBackoff(retries - 1, delay * 2); // Exponential backoff
        }
    }


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
            return (0n);
        }
    }

    const isBusinessHoursInNY = () => {
        const timeZone = 'America/New_York';
        const hd = new Holidays('US'); // Initialize holidays for the US
        console.log("Holidays: ", hd.getHolidays(2024));

        // Get the current date and time in NY timezone as a formatted string
        const now = new Date();
        const nyTimeStr = formatInTimeZone(now, timeZone, "yyyy-MM-dd'T'HH:mm:ssXXX");
        console.log("NY Time: ", nyTimeStr);

        // Check if today is a holiday
        const currentDateStr = formatInTimeZone(now, timeZone, 'yyyy-MM-dd');
        console.log("Current Date: ", currentDateStr);
        if (hd.isHoliday(currentDateStr)) return false;

        // Check if today is a business day (Monday to Friday)
        const dayOfWeek = formatInTimeZone(now, timeZone, 'i'); // 'i' returns day of the week (1-7), where 1 is Monday
        console.log("Day of the Week: ", dayOfWeek);
        if (dayOfWeek > 5) return false;

        // Define business hours (9 AM - 5 PM in NY time)
        const startBusinessHoursStr = `${currentDateStr}T09:00:00-05:00`;
        const endBusinessHoursStr = `${currentDateStr}T17:00:00-05:00`;
        const startBusinessHours = parseISO(startBusinessHoursStr);
        const endBusinessHours = parseISO(endBusinessHoursStr);

        console.log("Start Business Hours: ", startBusinessHours);
        console.log("End Business Hours: ", endBusinessHours);

        // Check if within general business hours
        if (!(isAfter(now, startBusinessHours) && isBefore(now, endBusinessHours))) {
            return false;
        }

        // Define restricted time period (2:45 PM - 3:45 PM in NY time)
        const startRestrictedHoursStr = `${currentDateStr}T14:45:00-05:00`;
        const endRestrictedHoursStr = `${currentDateStr}T15:45:00-05:00`;
        const startRestrictedHours = parseISO(startRestrictedHoursStr);
        const endRestrictedHours = parseISO(endRestrictedHoursStr);

        console.log("Start Restricted Hours: ", startRestrictedHours);
        console.log("End Restricted Hours: ", endRestrictedHours);

        // Check if within restricted hours
        if (isAfter(now, startRestrictedHours) && isBefore(now, endRestrictedHours)) {
            return false;
        }

        return true;
    };

    console.groupCollapsed('Holidays Group');
    const businessHours = isBusinessHoursInNY();
    console.log(`%cBusiness Hours in NY: ${businessHours}`, 'color: red; background-color: yellow;');
    console.groupEnd();

    useEffect(() => {
        setFromNetwork(network1);
        setToNetwork(network2);

    }, [network1, network2]);

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

    }, [fromNetwork, toNetwork, network1, network2]);

    async function handleTransaction(fromNetwork, toNetwork) {
        try {
            if (!isBusinessHoursInNY && !BRIDGE_PRODUCTION_VERSION) {
                setNotBusinessHoursDialogOpen(true);
                return;
            }
            console.group('Handling transaction');
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
    
            // Check and switch network if needed
            if (sourceChainId !== chainId) {
                setButtonLabelStatus("Switching to correct blockchain");
                await switchNetwork(sourceChainId);
            }
    
            const balance = await getNativeTokenBalanceWithBackoff();
            console.log("Native Balance: ", balance);
    
            // getethersProvider & Signer as well as the Bridge Contract
            const ethersProvider = await new ethers.BrowserProvider(walletProvider);
            await ethersProvider.send("eth_requestAccounts", []);
            const signer = await ethersProvider.getSigner();
            const bridgeContract = await new ethers.Contract(contractSourceAddress, BridgeABI, signer);
    
            // Get the quote for the transaction
            setButtonLabelStatus("Getting quote");
            const numberOfAssets = ethers.parseUnits(amount.toString(), 6);
    
            const quote = await bridgeContract.quoteBridge(wormholeTargetChainId);
            setQuote(quote);
    
            setSnackbarMessage('Processing transaction...');
            setSnackbarOpen(true);
    
            // Check if the native balance is sufficient
            if (balance < quote) {
                setBalanceDialogOpen(true);  // Show dialog if native balance is insufficient
                setLoading(false);
                return;  // Cancel the transaction
            }
    
            // Sign and send the bridging transaction
            setButtonLabelStatus(`Signing bridging transaction. Estimated cost: ${formatUnits(quote, 18)} ${fromNetwork.nativeCurrencySymbol}`);
            const bridgeTx = await bridgeContract.bridgeDSTokens(wormholeTargetChainId, numberOfAssets, {
                value: quote, // Pass the quote value as the payment
            });
            await bridgeTx.wait();
    
            setSnackbarMessage('Transaction successful!');
            setSnackbarSeverity('success');
    
            setTxHash(bridgeTx.hash);
            setDialogOpen(true);  // Open the transaction dialog
    
        } catch (err) {
            console.error("Transaction failed: ", err);
            const errorMessage = err.info?.error?.message || err.message || "Transaction failed.";
            setSnackbarMessage(`Error: ${errorMessage}`);
            setSnackbarSeverity('error');
            setSnackbarOpen(true);
        } finally {
            setLoading(false);  // End loading
            setSnackbarOpen(true);
            setAmount(0);  // Reset the amount after transaction
            if (walletProvider) {
                getTokenBalance(fromNetwork, sourceAssetAddress, setSourceAssetBalance);
                getTokenBalance(toNetwork, targetAssetAddress, setTargetAssetBalance);
            }
            setButtonLabelStatus(null);
            console.groupEnd();
        }
    }

    // Handle switching the From and To networks
    const handleSwitch = () => {
        setIsSwitched(!isSwitched);
        setIsRotated(!isRotated);
        setAmount(0);  // Reset amount when switching
        setExpectedAmount(0);
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
                onClick={() => handleTransaction(isSwitched ? toNetwork : fromNetwork, isSwitched ? fromNetwork : toNetwork)}
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

            {/* Insufficient Balance Dialog */}
            <InsufficientBalanceDialog
                open={balanceDialogOpen}
                onClose={handleBalanceDialogClose}
                nativeBalance={nativeBalance}
                quote={quote}
                currencySymbol={isSwitched ? toNetwork.nativeCurrencySymbol : fromNetwork.nativeCurrencySymbol}
            />

            {/* Transaction Progress Dialog */}
            <TransactionProgressDialog
                open={dialogOpen}
                onClose={handleDialogClose}
                txHash={txHash}
            />

            {/* Not Business Hours Dialog */}
            <NotBusinessDayDialog
                open={notBusinessHoursDialogOpen}
                onClose={() => setNotBusinessHoursDialogOpen(false)}
            />
        </Box>
    );
};

export default Bridge;
