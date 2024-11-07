import React, { useEffect, useState } from 'react';
import { Box, Typography, TextField } from '@mui/material';
import buidlIcon from '../../../assets/buidl_32.png'; // Default BUIDL icon
import NetworkSelector from './NetworkSelector';

import { blockchainInfo } from '../../../utils/globals';

const CryptoInput = ({ network, otherNetwork, setNetwork, amount, balance, setAmount, editable = true, label = "From", assetSymbol = "BUIDL", assetIcon = buidlIcon }) => {
    // Mock price data for assets
    const assetPrice = 1; // Assuming 1 BUIDL = 1 USD

    // Function to format numbers as USD
    const formatCurrency = (value) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2,
        }).format(value);
    };

    const handleAmountChange = (e) => {
        const value = parseFloat(e.target.value);
        if (value <= balance && value >= 0) {
            setAmount(value);
        }
        if (isNaN(value)) setAmount();
    };

    const getNetworkIcon = (network) => {
        // Loop through the blockchainInfo object and find the matching network name
        for (const key in blockchainInfo) {
            if (blockchainInfo[key].name === network) {
                return blockchainInfo[key].icon;
            }
        }
        // Default icon if no match is found
        return null;
    };

    const [modalOpen, setModalOpen] = useState(false);

    const handleOpenModal = () => {
        setModalOpen(true);
    };

    const handleCloseModal = () => {
        setModalOpen(false);
    };

    const handleNetworkSelect = (network) => {
        // setNetwork(network);
        console.log('Selected network:', network);
        setModalOpen(true);
    };

    // Common styles
    const cryptoInputStyles = {
        container: {
            padding: '12px',
            backgroundColor: '#2a2d42',
            borderRadius: 2,
            color: '#fff',
            // width: '100%',
            // maxWidth: '800px',
            display: 'flex',
            gap: 2,
        },
        networkBox: {
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#3a3d5b',
            padding: 2,
            borderRadius: 2,
            width: '33%',
        },
        label: {
            position: 'absolute',
            top: 8,
            left: 8,
            fontSize: '1.4em',
            fontWeight: 'bold'

        },
        typography: {
            color: '#9fa4c4',
            marginBottom: 1,
        },
        assetBox: {
            backgroundColor: '#3a3d5b',
            padding: 2,
            borderRadius: 2,
        },
        amountInput: {
            backgroundColor: '#3a3d5b',
            borderRadius: 1,
            input: {
                color: '#fff',
                height: '0.7em',
                '&::-webkit-outer-spin-button, &::-webkit-inner-spin-button': {
                    WebkitAppearance: 'none',
                    margin: 0,
                },
                '&:focus': {
                    boxShadow: 'none',
                },
            },
            '& .MuiOutlinedInput-root': {
                '& fieldset': {
                    borderColor: 'none',
                },
                '&:hover fieldset': {
                    borderColor: '#5c6185',
                },
                '&.Mui-focused fieldset': {
                    borderColor: '#5c6185',
                    borderWidth: '2px',
                },
            },
        },
        balanceBox: {
            // width: '150px',
            width: '25%',
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: '#2a2d42',
            padding: '1em',
            borderRadius: 2,
        },
        amountBox: {
            backgroundColor: '#3a3d5b',
            padding: 1,
            borderRadius: 2,
        },
        flexBox: {
            display: 'flex',
            justifyContent: 'space-between',
            gap: 2,
            // backgroundColor: '#3a3d5b',
            backgroundColor: '#2a2d42',
            // padding: 2,
            borderRadius: 2,
        },
    };


    return (
        <>
            <Box sx={cryptoInputStyles.container}>
                {/* Network Component */}
                <Box
                    sx={{
                        ...cryptoInputStyles.networkBox, // Keep the existing styles
                        cursor: 'pointer', // Add this line to change the cursor on hover
                    }}
                    onClick={() => handleNetworkSelect(network)}
                >
                    {/* Label Inside Network Box aligned top left */}
                    <Typography sx={{ ...cryptoInputStyles.label }}>{label}</Typography>
                    <Typography sx={cryptoInputStyles.typography}>Network</Typography>
                    <img
                        src={getNetworkIcon(network)}
                        alt={`${network} Icon`}
                        style={{ width: '60px', height: '60px' }}
                    />
                    <Typography sx={{ fontWeight: 'bold', marginTop: 1, textAlign: 'center' }}>{network}</Typography>
                </Box>

                {/* Right Section (Asset, Amount, and Balance) */}
                <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%', gap: 2 }}>
                    {/* Asset Display */}
                    <Box sx={cryptoInputStyles.assetBox}>
                        <Typography sx={cryptoInputStyles.typography}>Asset</Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <img src={assetIcon} width={'32px'} />
                            <Typography sx={{ color: '#fff', padding: '8px' }}>{assetSymbol}</Typography>
                        </Box>
                    </Box>

                    {/* Amount and Balance */}
                    <Box sx={cryptoInputStyles.flexBox}>
                        {/* Amount Section */}
                        <Box sx={{ ...cryptoInputStyles.amountBox, flex: 1 }}>
                            <Typography sx={cryptoInputStyles.typography}>{editable ? 'Amount' : 'Expected Amount'}</Typography>
                            <TextField
                                variant="outlined"
                                value={amount}
                                onChange={handleAmountChange}
                                type="number"
                                inputProps={{ min: 0, max: balance, readOnly: !editable }}
                                sx={cryptoInputStyles.amountInput}
                                fullWidth
                            />
                            <Typography sx={{ color: '#9fa4c4', marginTop: 1 }}>
                                {!isNaN(amount) ? `(~${formatCurrency(amount * assetPrice)})` : '(~$0.00)'}
                            </Typography>
                        </Box>

                        {/* Balance Section */}
                        <Box sx={cryptoInputStyles.balanceBox}>
                            <Typography sx={cryptoInputStyles.typography}>Balance</Typography>
                            <Typography sx={{ fontWeight: 'bold', color: '#fff' }}>{balance}</Typography>
                            <Typography sx={{ color: '#9fa4c4', marginTop: 0 }}>
                                {`(~${formatCurrency(balance * assetPrice)})`}
                            </Typography>
                        </Box>
                    </Box>
                </Box>
            </Box >
            <NetworkSelector
                open={modalOpen}
                onClose={handleCloseModal}
                onSelect={setNetwork}
                label="Choose Your Blockchain Network"
                currentNetwork={network}
                otherNetwork={otherNetwork}
            />
        </>
    );

};

export default CryptoInput;