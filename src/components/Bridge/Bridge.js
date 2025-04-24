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
import { format, isBefore, isAfter, parseISO, set } from 'date-fns';
import { formatInTimeZone, toDate } from 'date-fns-tz';
import Holidays from 'date-holidays';
import NotBusinessDayDialog from './components/NotBusinessDayDialog';
import { BRIDGE_PRODUCTION_VERSION } from '../../utils/globals';


//////////////////////////////////////////////////////
/// // ____                       _ _   _         
// // / ___|  ___  ___ _   _ _ __(_) |_(_)_______ 
// // \___ \ / _ \/ __| | | | '__| | __| |_  / _ \
// //  ___) |  __/ (__| |_| | |  | | |_| |/ /  __/
// // |____/ \___|\___|\__,_|_|  |_|\__|_/___\___|
/////////////////////////////////////////////////////
// Securitize Bridge for BUIDL
// Version: 1.0.0
/////////////////////////////////////////////////////

const Bridge = ({ network1, network2 }) => {
    // Asset-related states
    const [amount, setAmount] = useState(0);  // Amount to bridge
    const [expectedAmount, setExpectedAmount] = useState(0);  // Expected amount to receive after bridging
    const [sourceAssetAddress, setSourceAssetAddress] = useState(network1.assets[0].address);  // Source asset address
    const [targetAssetAddress, setTargetAssetAddress] = useState(network2.assets[0].address);  // Target asset address
    const [sourceAsset, setSourceAsset] = useState(network1.assets[0]);  // Source asset
    const [targetAsset, setTargetAsset] = useState(network2.assets[0]);  // Target asset
    const [sourceAssetBalance, setSourceAssetBalance] = useState(0);  // Balance of source asset
    const [targetAssetBalance, setTargetAssetBalance] = useState(0);  // Balance of target asset

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

    const [selectedAsset, setSelectedAsset] = useState(null);

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

        console.groupCollapsed('%c🔍 Fetching Native Token Balance', 'color: #2e86de; font-weight: bold;');
        try {
            const ethersProvider = new ethers.BrowserProvider(walletProvider);
            const balance = await ethersProvider.getBalance(address);
            setNativeBalance(balance);
            console.log('%c✅ Raw Native Balance:', 'color: green; font-weight: bold;', balance);
            console.log('%c💱 Formatted Native Balance:', 'color: #27ae60; font-weight: bold;', formatUnits(balance, 18));
            return balance;
        } catch (error) {
            console.error('%c❌ Failed to fetch native token balance:', 'color: red; font-weight: bold;', error);
            setNativeBalance(0);
        } finally {
            console.groupEnd();
        }
    }

    // Function to get the native token balance with exponential backoff
    async function getNativeTokenBalanceWithBackoff(retries = 5, delay = 1000) {
        try {
            return await getNativeTokenBalance();
        } catch (error) {
            if (retries === 0) {
                console.error('%c🛑 All retries failed. Giving up.', 'color: red; font-weight: bold;');
                throw error;
            }
            console.warn(`%c⏳ Retrying in ${delay / 1000}s... (${retries} retries left)`, 'color: orange; font-weight: bold;');
            await new Promise(resolve => setTimeout(resolve, delay));
            return getNativeTokenBalanceWithBackoff(retries - 1, delay * 2); // Exponential backoff
        }
    }


    // Function to get token balance
    async function getTokenBalance(network, token, setBalance) {
        if (!isConnected || !walletProvider) {
            console.warn('%c⚠️ User disconnected', 'color: orange; font-weight: bold;');
            setBalance(0);
            return;
        }

        if (!token) {
            console.error('%c❌ TOKEN IS NULL', 'color: red; font-weight: bold;');
            return;
        }

        // Find the asset in the network
        const asset = network.assets.find(a => a.symbol === token.symbol);

        console.log('%c📋 Assets:', 'color: #8e44ad; font-weight: bold;', network.assets);
        if (!asset) {
            console.error('%c❌ Asset ' + token.symbol + ' not found in network ' + network.name + '.', 'color: red; font-weight: bold;');
            setBalance(0);
            return;
        } else {
            console.log('%c✅ Asset found:', 'color: green; font-weight: bold;', asset);
        }

        try {
            const ethersProvider = new ethers.JsonRpcProvider(network.rpcUrl);
            const contract = new Contract(asset.address, ERC20ABI, ethersProvider);
            const tokenBalance = await contract.balanceOf(address);
            const formattedBalance = ethers.formatUnits(tokenBalance, 6); // Adjust decimals as needed
            setBalance(formattedBalance);

            console.log('%c🎯 Getting token balance for:', 'color: #8e44ad; font-weight: bold;', token.symbol);
            console.groupCollapsed('%c🔗 Asset Details', 'color: #2ecc71; font-weight: bold;');
            console.log('%c🔌 Provider:', 'color: #3498db; font-weight: bold;', ethersProvider);
            console.log('%c📜 Contract:', 'color: #9b59b6; font-weight: bold;', contract);
            console.log('%c💰 Token Balance:', 'color: #34495e; font-weight: bold;', tokenBalance);
            console.log('%c💱 Formatted Balance:', 'color: #27ae60; font-weight: bold;', formattedBalance);
            console.groupEnd();

        } catch (error) {
            console.error("Failed to fetch balance: ", error);
            console.error("Network: ", network);
            console.error("Asset Symbol: ", token.symbol);
            setBalance(0);
            return (0n);
        }
    }

    const isBusinessHoursInNY = () => {
        const timeZone = 'America/New_York';

        // Define the list of custom holidays (hardcoded)
        const customHolidays = [
            '2025-01-01', // New Year's Day
            '2025-01-09', // Jimmy Carter Memoriam
            '2025-01-20', // MLK Day
            '2025-02-17', // President's Day
            '2025-04-18', // Good Friday
            '2025-05-26', // Memorial Day
            '2025-06-19', // Juneteenth
            '2025-07-04', // Independence Day
            '2025-09-01', // Labor Day
            '2025-10-13', // Columbus Day
            '2025-11-11', // Veterans Day
            '2025-11-27', // Thanksgiving
            '2025-12-25', // Christmas
        ];

        const isCustomHoliday = (date) => {
            // Check if the provided date (in 'yyyy-MM-dd' format) is in the list of holidays
            return customHolidays.includes(date);
        };

        // Get the current date and time in NY timezone
        const now = new Date();
        const nyTimeStr = formatInTimeZone(now, timeZone, "yyyy-MM-dd'T'HH:mm:ssXXX");
        console.log('%c🕒 NY Time:', 'color: #8e44ad; font-weight: bold;', nyTimeStr);

        // Get "current date + 9 hours" in NY timezone
        const nowPlus9Hours = new Date(now.getTime() + 9 * 60 * 60 * 1000);
        const currentDatePlus9Str = formatInTimeZone(nowPlus9Hours, timeZone, 'yyyy-MM-dd');
        console.log('%c🕒 Current Date + 9 Hours:', 'color: #8e44ad; font-weight: bold;', currentDatePlus9Str);

        // Check if "current date + 9 hours" is a holiday
        if (isCustomHoliday(currentDatePlus9Str)) {
            console.log('%c🎉 It\'s a holiday based on +9 hours logic.', 'color: #e67e22; font-weight: bold;');
            return false;
        } else {
            console.log('%c✅ It\'s not a holiday based on +9 hours logic.', 'color: green; font-weight: bold;');
        }

        // Check if today is Sunday and before 3:05 PM
        const dayOfWeek = formatInTimeZone(now, timeZone, 'i'); // 'i' returns day of the week (1-7), where 1 is Monday
        console.log('%c📆 Day of the Week:', 'color: #8e44ad; font-weight: bold;', dayOfWeek);
        if (dayOfWeek == 7) { // Sunday
            const sundayOpenTimeStr = `${currentDatePlus9Str}T15:05:00-05:00`;
            const sundayOpenTime = parseISO(sundayOpenTimeStr);
            if (isBefore(now, sundayOpenTime)) {
                console.log('%c⚠️ It\'s Sunday and before 3 PM.', 'color: orange; font-weight: bold;');
                return false;
            }
        }

        // Define restricted hours (2:40 PM - 3:05 PM every day)
        const currentDateStr = formatInTimeZone(now, timeZone, 'yyyy-MM-dd');
        const startRestrictedHoursStr = `${currentDateStr}T14:40:00-05:00`;
        const endRestrictedHoursStr = `${currentDateStr}T15:05:00-05:00`;
        const startRestrictedHours = parseISO(startRestrictedHoursStr);
        const endRestrictedHours = parseISO(endRestrictedHoursStr);

        if (isAfter(now, startRestrictedHours) && isBefore(now, endRestrictedHours)) {
            console.log('%c⚠️ Currently within restricted hours (2:40 PM - 3 PM).', 'color: orange; font-weight: bold;');
            return false;
        }

        // All checks passed
        return true;
    };

    const getAssetInfo = (network, assetSymbol) => {
        if (!network || !network.assets) {
            console.warn("Invalid network object or missing assets array.");
            return null;
        }

        // Find the asset by symbol
        const asset = network.assets.find(asset => asset.symbol === assetSymbol);

        if (!asset) {
            console.warn(`Asset ${assetSymbol} not found in network ${network.name}.`);
            return null;
        }

        return asset;
    };

    useEffect(() => {
        setFromNetwork(network1);
        setToNetwork(network2);

    }, [network1, network2]);


    // Synchronize amounts after switching or when the amount changes
    useEffect(() => {
        // console.log('%c🗂️ The blockchain Info:', 'color: #8e44ad; font-weight: bold;', blockchainInfo)
        if (!isSwitched) {
            setExpectedAmount(amount);  // When not switched, update expectedAmount with amount
        } else {
            setAmount(expectedAmount);  // When switched, update amount with expectedAmount
        }
    }, [amount, expectedAmount, isSwitched]);

    useEffect(() => {
        console.log('%c🔌 Connected:', 'color: #8e44ad; font-weight: bold;', isConnected);
        if (isConnected) {
            getTokenBalance(fromNetwork, getAssetInfo(fromNetwork, selectedAsset?.symbol), setSourceAssetBalance);
            getTokenBalance(toNetwork, getAssetInfo(toNetwork, selectedAsset?.symbol), setTargetAssetBalance);
        } else {
            setSourceAssetBalance(0);
            setTargetAssetBalance(0);
        }
    }, [isConnected]);


    // Synchronize assets after selecting an asset
    // This effect is triggered when the user selects an asset from the dropdown
    useEffect(() => {
        // Function to find networks that support the selected asset
        // It returns an array of networks that support the asset
        const findNetworksForAsset = (blockchainInfo, assetSymbol) => {
            let foundNetworks = [];

            Object.keys(blockchainInfo).forEach(networkKey => {
                const network = blockchainInfo[networkKey];

                if (network.assets && network.assets.some(asset => asset.symbol === assetSymbol)) {
                    foundNetworks.push({
                        name: network.name,
                        chainId: network.chainId,
                        nativeCurrency: network.nativeCurrencySymbol,
                        rpcUrl: network.rpcUrl,
                        icon: network.icon,
                    });
                }

                // Stop searching once we find 2 networks
                if (foundNetworks.length === 2) {
                    return;
                }
            });

            return foundNetworks;
        };

        // Function to set the source and target networks based on the selected asset
        // It sets the source and target networks based on the found networks
        const setNetworksForAsset = (blockchainInfo, assetSymbol, setSourceNetwork, setTargetNetwork) => {
            const foundNetworks = findNetworksForAsset(blockchainInfo, assetSymbol);
            let sourceNetwork = null;
            let targetNetwork = null;

            if (foundNetworks.length >= 1) {
                const sourceNetworkKey = Object.keys(blockchainInfo).find(
                    key => blockchainInfo[key].name === foundNetworks[0].name
                );
                setSourceNetwork(blockchainInfo[sourceNetworkKey]);
                sourceNetwork = blockchainInfo[sourceNetworkKey];
            }

            if (foundNetworks.length >= 2) {
                const targetNetworkKey = Object.keys(blockchainInfo).find(
                    key => blockchainInfo[key].name === foundNetworks[1].name
                );
                setTargetNetwork(blockchainInfo[targetNetworkKey]);
                targetNetwork = blockchainInfo[targetNetworkKey];
            }
            return [sourceNetwork, targetNetwork];
        };

        if (selectedAsset) {
            console.log('%c🎯 Selected Asset:', 'color: #8e44ad; font-weight: bold;', selectedAsset);
            // Find the networks that support the selected asset
            const networksWithAsset = findNetworksForAsset(blockchainInfo, selectedAsset?.symbol);

            console.log('%c🔗 Networks with ' + selectedAsset?.symbol + ':', 'color: #8e44ad; font-weight: bold;', networksWithAsset);

            const nets = setNetworksForAsset(blockchainInfo, selectedAsset?.symbol, setFromNetwork, setToNetwork);
            setSourceAsset(getAssetInfo(fromNetwork, selectedAsset?.symbol));
            setTargetAsset(getAssetInfo(toNetwork, selectedAsset?.symbol));

            getTokenBalance(nets[0], getAssetInfo(nets[0], selectedAsset?.symbol), setSourceAssetBalance);
            getTokenBalance(nets[1], getAssetInfo(nets[1], selectedAsset?.symbol), setTargetAssetBalance);
        }
    }, [selectedAsset]);

    useEffect(() => {
        if (dialogOpen === false)
            getTokenBalance(fromNetwork, getAssetInfo(fromNetwork, selectedAsset?.symbol), setSourceAssetBalance);
    }, [fromNetwork, dialogOpen]);

    useEffect(() => {
        if (dialogOpen === false)
            getTokenBalance(toNetwork, getAssetInfo(toNetwork, selectedAsset?.symbol), setTargetAssetBalance);
    }, [toNetwork, dialogOpen]);

    useEffect(() => {
        setAmount(0);
        setExpectedAmount(0);
    }, [fromNetwork, toNetwork, selectedAsset]);

    // Function to handle the bridging transaction
    // This function is called when the user clicks the "Bridge" button
    // It handles the entire transaction process, including network switching, balance checks, and transaction signing
    // It also displays feedback messages to the user via Snackbars
    // It also displays dialogs for insufficient balance and transaction progress
    // It also checks if the transaction is initiated during business hours
    async function handleTransaction(fromNetwork, toNetwork) {
        try {
            console.groupCollapsed('%c🗓️ Holidays Group', 'color: #2980b9; font-weight: bold;');
            const businessHours = isBusinessHoursInNY();
            console.log(`%cBusiness Hours in NY: ${businessHours}`, 'color: red; background-color: yellow;');
            console.groupEnd();

            if (BRIDGE_PRODUCTION_VERSION === true && businessHours === false) {
                setNotBusinessHoursDialogOpen(true);
                return;
            }
            console.groupCollapsed('%c⚙️ Handling Transaction', 'color: #2980b9; font-weight: bold;');
            setLoading(true);  // Start loading
            setSnackbarMessage('Initiating transaction...');
            setSnackbarSeverity('info');
            setSnackbarOpen(true);

            let contractSourceAddress = getAssetInfo(fromNetwork, selectedAsset.symbol).bridgeContractAddress;
            console.log('%c🏦 Contract Source Address:', 'color: #8e44ad; font-weight: bold;', contractSourceAddress);
            let sourceChainId = fromNetwork.chainId;
            let wormholeTargetChainId = toNetwork.wormholeChainId;

            // Check and switch network if needed
            if (sourceChainId !== chainId) {
                setButtonLabelStatus("Switching to correct blockchain");
                await switchNetwork(sourceChainId);
            }

            const balance = await getNativeTokenBalanceWithBackoff();
            console.log('%c💰 Native Balance:', 'color: #27ae60; font-weight: bold;', balance);

            const ethersProvider = new ethers.JsonRpcProvider(fromNetwork.rpcUrl);

            const bridgeContract = new Contract(contractSourceAddress, BridgeABI, ethersProvider);
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

            const ethersProviderToSign = await new ethers.BrowserProvider(walletProvider);
            await ethersProviderToSign.send("eth_requestAccounts", []);
            const signer = await ethersProviderToSign.getSigner();
            const bridgeContractToSign = new Contract(contractSourceAddress, BridgeABI, signer);

            // Sign and send the bridging transaction
            setButtonLabelStatus(`Signing bridging transaction. Estimated cost: ${formatUnits(quote, 18)} ${fromNetwork.nativeCurrencySymbol}`);
            const bridgeTx = await bridgeContractToSign.bridgeDSTokens(wormholeTargetChainId, numberOfAssets, {
                value: quote, // Pass the quote value as the payment
            });
            await bridgeTx.wait();

            setSnackbarMessage('Transaction successful!');
            setSnackbarSeverity('success');

            setTxHash(bridgeTx.hash);
            setDialogOpen(true);  // Open the transaction dialog
        } catch (err) {
            console.error('%c❌ Transaction failed:', 'color: red; font-weight: bold;', err);
            let errorMessage = err?.reason || err?.info?.error?.message || err?.message || "Transaction failed.";
            if (errorMessage.includes('execution reverted:')) {
                const match = errorMessage.match(/execution reverted:\s*"?([^"]+)"?/);
                if (match && match[1]) {
                    errorMessage = match[1];
                }
            }
            setSnackbarMessage(`Error: ${errorMessage}`);
            setSnackbarSeverity('error');
            setSnackbarOpen(true);
        } finally {
            setLoading(false);  // End loading
            setSnackbarOpen(true);
            setAmount(0);  // Reset the amount after transaction
            setExpectedAmount(0);
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
                assetSymbol={selectedAsset?.symbol}
                assetIcon={selectedAsset?.icon}
                selectedAsset={selectedAsset}
                setSelectedAsset={setSelectedAsset}
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
                assetSymbol={selectedAsset?.symbol}
                assetIcon={selectedAsset?.icon}
                selectedAsset={selectedAsset}
                setSelectedAsset={setSelectedAsset}
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
