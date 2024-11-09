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


const NetworkSelectorModal = ({ open, onClose, onSelect, label, currentNetwork, otherNetwork }) => {
    const { showMainNets } = useAppContext();
    const handleNetworkSelect = (networkKey) => {
        if (onSelect) {
            onSelect(blockchainInfo[networkKey]);
            console.log("Current Network: ", currentNetwork);
            console.log("Other Network: ", otherNetwork);
            console.log("Selected Network: ", networkKey, blockchainInfo[networkKey]);
        }
        onClose(); // Close modal after selecting network
    };

    // Filter out the current network and the other network
    const validNetworks = Object.keys(blockchainInfo).filter(
        (key) =>
            blockchainInfo[key].bridgeContractAddress &&
            blockchainInfo[key].name !== currentNetwork &&
            blockchainInfo[key].name !== otherNetwork &&
            blockchainInfo[key].mainnet === showMainNets // false: Testing mode: only show testnets
    );

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