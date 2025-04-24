import React, { useState, useEffect } from 'react';
import { Box, FormControl, InputLabel, MenuItem, Select, Typography, CardMedia } from '@mui/material';
import { AssetAddress, blockchainInfo, VaultAddress } from '../../../utils/globals'; // Import blockchain info

import { useSwitchNetwork } from '@web3modal/ethers/react';
import { useAppContext } from '../../../utils/AppContext'; // Import AppContext.js

function BlockchainSwitcher() {
    const [selectedChainId, setSelectedChainId] = useState('');
    const { switchNetwork } = useSwitchNetwork();
    const { vaultAddress, setVaultAddress } = useAppContext();
    const { vaultAssetAddress, setVaultAssetAddress } = useAppContext();
    const { TargetBlockchainChainId, setTargetBlockchainChainId } = useAppContext();
    const [selectedChain, setSelectedChain] = useState('');

    const { showMainNets } = useAppContext();

    // Filter blockchains with a vaultAddress
    const availableBlockchains = Object.entries(blockchainInfo).filter(
        ([, chain]) => chain.vaultAddress &&
            chain.mainnet === showMainNets // false: Testing mode: only show testnets
    );

    useEffect(() => {
        const defaultChain = availableBlockchains[0];
        setSelectedChain(defaultChain[0]);
        handleChange({ target: { value: defaultChain[0] } });
    }, [availableBlockchains]);

    const handleChange = async (event) => {
        const chainKey = event.target.value;
        const chain = blockchainInfo[chainKey];

        setSelectedChain(chainKey);

        const selectedChainData = blockchainInfo[chainKey];
        console.log(`Switched to chain: ${selectedChainData.name}`);
        console.log(`Vault Address: ${selectedChainData.vaultAddress}`);
        console.log(`Chain ID: ${selectedChainData.chainId}`);

        try {
            await switchNetwork(chain.chainId);
            setSelectedChainId(chainKey);
            // setVaultAddress(chain.vaultAddress); // Set the vault address
            // setVaultAssetAddress(chain.vaultAssetAddress); // Set the vault asset address
            setVaultAddress(chain.vaultAddress); // Set the vault address
            setVaultAssetAddress(chain.vaultAssetAddress); // Set the vault asset address
            setTargetBlockchainChainId(chain.chainId); // Set the target blockchain chain ID

            console.group("Switched Network");
            console.log(`Switched to chain: ${chain.name} (ID: ${chain.chainId})`);
            console.log(`Vault Address: ${chain.vaultAddress}`);
            console.log(`Vault Asset: ${chain.vaultAssetAddress}`);
            console.log(`Target Blockchain Chain ID: ${chain.chainId}`);
            console.groupEnd();

        } catch (error) {
            console.error('Error switching network:', error);
        }
    };

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 3 }}>
            <Typography variant="h6" gutterBottom>
                Select Blockchain
            </Typography>
            <FormControl fullWidth variant="outlined" sx={{ maxWidth: 400 }}>
                <InputLabel id="blockchain-selector-label">Blockchain</InputLabel>
                <Select
                    labelId="blockchain-selector-label"
                    id="blockchain-selector"
                    value={selectedChain}
                    onChange={handleChange}
                    label="Blockchain"
                >
                    {availableBlockchains.map(([chainKey, chain]) => (
                        <MenuItem key={chainKey} value={chainKey}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <CardMedia
                                    component="img"
                                    src={chain.icon}
                                    alt={chain.name}
                                    sx={{ width: 24, height: 24, borderRadius: '50%' }}
                                />
                                <Typography variant="body1">{chain.name}</Typography>
                            </Box>
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>
        </Box>
    );
}

export default BlockchainSwitcher;