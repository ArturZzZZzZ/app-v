import React from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Box,
    Button,
    Typography,
} from '@mui/material';
import { blockchainInfo } from '../../../utils/globals'; // Adjust the import path
import { useAppContext } from '../../../utils/AppContext'; // Adjust the import path

function findAssetsBySymbol(blockchainInfo, targetSymbol) {
    return Object.keys(blockchainInfo)
        .flatMap((key) => {
            const network = blockchainInfo[key];
            return network.assets
                ? network.assets
                    .filter((asset) => asset.symbol === targetSymbol)
                    .map((asset) => ({
                        ...asset,
                        network: network.name, // Include network name for reference
                        network: network, // Include network object for reference
                    }))
                : [];
        });
}

const NetworkSelectorModal = ({ open, onClose, onSelect, label, currentNetwork, otherNetwork, assetSymbol }) => {
    const { showMainNets } = useAppContext();
    const handleNetworkSelect = (networkKey) => {
        if (onSelect) {
            onSelect(blockchainInfo[networkKey]);
            console.log("Current Network: ", currentNetwork);
            console.log("Other Network: ", otherNetwork);
            console.log("Selected Network: ", networkKey, blockchainInfo[networkKey]);
            console.log("Asset Symbol: ", assetSymbol);
            // Example usage
            const matchingAssets = findAssetsBySymbol(blockchainInfo, assetSymbol);
            console.log("Matching Assets: ", matchingAssets);

        }
        onClose(); // Close modal after selecting network
    };

    // Filter networks based on their assets containing assetSymbol and having a bridgeContractAddress
    const validNetworks = Object.keys(blockchainInfo).filter((key) => {
        const network = blockchainInfo[key];

        // Ensure network is not the current or other network
        if (network.name === currentNetwork || network.name === otherNetwork) return false;

        // Ensure network matches the mainnet/testnet setting
        if (network.mainnet !== showMainNets) return false;

        // Check if any asset in the network has the given assetSymbol and a defined bridgeContractAddress
        const hasMatchingAsset = network.assets?.some(asset =>
            asset.symbol === assetSymbol && asset.bridgeContractAddress
        );

        return hasMatchingAsset;
    });


    return (
        <Dialog open={open} onClose={onClose} fullWidth>
            <DialogTitle>{label || 'Select a Network'}</DialogTitle>
            <DialogContent>
                {/* Responsive Flexbox Container */}
                <Box
                    sx={{
                        display: 'flex',
                        flexWrap: 'wrap', // Allows the networks to wrap onto new lines
                        justifyContent: 'space-around', // Distribute networks evenly
                        gap: '16px', // Space between items
                    }}
                >
                    {validNetworks.map((key) => (
                        <Box
                            key={key}
                            sx={{
                                display: 'flex',
                                flexDirection: 'column', // Align icon and text vertically
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                padding: '16px',
                                borderRadius: '8px',
                                border: '1px solid #ccc',
                                width: '80px', // Fixed width
                                height: '80px', // Fixed height
                                textAlign: 'center',
                                '&:hover': {
                                    backgroundColor: '#f0f0f0', // Hover effect
                                },
                            }}
                            onClick={() => handleNetworkSelect(key)}
                        >
                            {/* Network Icon */}
                            <Box
                                component="img"
                                src={blockchainInfo[key].icon}
                                alt={blockchainInfo[key].name}
                                sx={{ width: 48, height: 48, marginBottom: '8px' }} // Spacing between icon and text
                            />
                            {/* Network Name */}
                            <Typography variant="caption">{blockchainInfo[key].name}</Typography>
                        </Box>
                    ))}
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} color="primary">
                    Close
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default NetworkSelectorModal;