import React, { useState, useEffect } from 'react';
import { Box, Typography, MenuItem, Select } from '@mui/material';
import { useAppContext } from '../../../utils/AppContext'; // Adjust the import path
import { blockchainInfo } from '../../../utils/globals';

const cryptoInputStyles = {
    assetBox: {
        backgroundColor: '#3a3d5b',
        // padding: 2,
        borderRadius: 2,
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        // width: '90%',
        // margin: 'auto',
        // gap: 2,
    },
    typography: {
        color: '#9fa4c4',
        marginBottom: 0,
    },
    select: {
        backgroundColor: '#2a2d42',
        color: '#fff',
        borderRadius: 2,
        marginLeft: 2,
        // minWidth: '200px',
        // icon: {
        //     fill: '#fff',
        // },
        '& .MuiSelect-select': {
            display: 'flex',
            alignItems: 'center',
            padding: '8px 12px',
        },
        '& .MuiOutlinedInput-notchedOutline': {
            borderColor: '#5c6185',
        },
        '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: '#9fa4c4',
        },
        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: '#9fa4c4',
        },
        '.MuiSvgIcon-root ': {
            fill: "white !important",
        }

    },
    label: {
        fontSize: '1.1em',
        fontWeight: 'bold'

    },
    menuItem: {
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
    },
    icon: {
        width: '24px',
        height: '24px',
        marginRight: '8px',
    },
};

const AssetDisplay = ({ onAssetChange, theAsset }) => {
    const [selectedAsset, setSelectedAsset] = useState(theAsset); // Default to first asset
    const [assets, setAssetsList] = useState(null);

    const { showMainNets } = useAppContext();

    useEffect(() => {
        const assetList = extractAssets(blockchainInfo);
        console.log("Asset List: ", assetList);

        setAssetsList(assetList);
        setSelectedAsset(assetList[0]);
        onAssetChange(assetList[0]);
    }, [showMainNets]);

    useEffect(() => {
        if (theAsset) {
            setSelectedAsset(theAsset);
        }
    }, [theAsset]);


    const handleChange = (event) => {
        const newAsset = assets.find(asset => asset.symbol === event.target.value);
        setSelectedAsset(newAsset);
        onAssetChange(newAsset);
        console.log("====> Selected Asset: ", newAsset);  
    };

    // Extract unique assets from the blockchain data
    // This function is used to populate the asset dropdowns
    // It returns an array of unique assets
    const extractAssets = (blockchainData) => {
        let assetMap = new Map();

        Object.keys(blockchainData).forEach((chainKey) => {
            const chain = blockchainData[chainKey];
            if (chain.assets) {
                chain.assets.forEach((asset) => {
                    // Only add the asset if its symbol is not already in the map
                    if (!assetMap.has(asset.symbol)) {
                        assetMap.set(asset.symbol, {
                            symbol: asset.symbol,
                            icon: asset.icon,
                            name: asset.name,
                            address: asset.address,
                            bridgeContractAddress: asset.bridgeContractAddress,
                            mainnet: chain.mainnet,
                        });
                    }
                });
            }
        });
        // Filter out valid assets
        const validAssets = Array.from(assetMap.values()).filter(
            (asset) => 
                asset.bridgeContractAddress && // Is an asset that can be bridged
                asset.mainnet === showMainNets  // false: Testing mode: only show testnets
        );

        // Convert map values to an array
        return validAssets;
    };


    return (
        selectedAsset && (
            <Box sx={cryptoInputStyles.assetBox}>
                {/* <Typography sx={cryptoInputStyles.label}>Select Asset: </Typography> */}
                <Select
                    value={selectedAsset.symbol}
                    onChange={handleChange}
                    sx={cryptoInputStyles.select}
                    variant="outlined"
                >
                    {assets.map((asset) => (
                        <MenuItem key={asset.symbol} value={asset.symbol} sx={cryptoInputStyles.menuItem}>
                            <img src={asset.icon} alt={asset.symbol} style={cryptoInputStyles.icon} />
                            {asset.symbol}
                        </MenuItem>
                    ))}
                </Select>
            </Box>
        )
    );
};

export default AssetDisplay;