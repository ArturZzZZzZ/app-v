import { TargetBlockchainChainId, walletConnectMetadata, walletConnectProjectId, walletConnectTargetBlockchainConfig, blockchainInfo } from '../../utils/globals';

import React, { useEffect, useState } from 'react';
import { createWeb3Modal, defaultConfig } from '@web3modal/ethers/react';
import { useWeb3Modal, useDisconnect } from '@web3modal/ethers/react';
import { Button, Typography, Box, Container, Paper, Tabs, Tab } from '@mui/material';
import { useWeb3ModalProvider, useWeb3ModalAccount } from '@web3modal/ethers/react';
import { ethers } from 'ethers';
import { VaultAddress } from '../../utils/globals';
import { VaultABI } from '../../utils/ABIs';

import VaultTransaction from './components/VaultTransaction';
import VaultAdmin from './components/VaultAdmin';
import SecuritizeCreditVault from './components/SecuritizeCreditVault';
import WalletDisplay from '../../utils/WalletDisplay';
import SmartContractInterface from './components/SmartContractInterfaces';

function SecuritizeCreditVaultApp() {
    const { address, chainId, isConnected } = useWeb3ModalAccount();
    const { disconnect } = useDisconnect();
    const { provider, setProvider } = useWeb3ModalProvider();
    const { walletProvider } = useWeb3ModalProvider();

    const isOnCorrectBlockchain = chainId === TargetBlockchainChainId;
    const [isAdmin, setIsAdmin] = useState(false);
    const [tabValue, setTabValue] = useState(0);

    useEffect(() => {
        const checkAdmin = async () => {
            if (!isConnected || !walletProvider) return;

            try {
                const ethersProvider = new ethers.BrowserProvider(walletProvider);

                const signer = await ethersProvider.getSigner();
                const vaultContract = new ethers.Contract(VaultAddress, VaultABI, signer);
                console.log("Vault Address: ", VaultAddress);
                console.log("Vault contract: ", vaultContract);

                const adminStatus = await vaultContract.isAdmin(address);
                console.log("Admin Status: ", adminStatus);
                setIsAdmin(adminStatus);
            } catch (error) {
                console.error('Failed to check admin status:', error);
            }
        };

        checkAdmin();
    }, [isConnected, walletProvider, address]);

    useEffect(() => {
        if (provider) {
            const handleAccountsChanged = async (accounts) => {
                if (accounts.length === 0) {
                    disconnect();
                } else {
                    setProvider(provider);
                }
            };

            const handleChainChanged = (chainId) => {
                disconnect();
            };

            provider.on('accountsChanged', handleAccountsChanged);
            provider.on('chainChanged', handleChainChanged);

            return () => {
                provider.removeListener('accountsChanged', handleAccountsChanged);
                provider.removeListener('chainChanged', handleChainChanged);
            };
        }
    }, [provider, disconnect]);

    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
    };

    return (
        // <Container className="SecuritizeCreditVault" >
        <Paper  >
            {isConnected ? ( 
                <>
                    <Box display="flex" justifyContent="space-between" alignItems="center" backgroundColor="#dadada" paddingLeft='1em' >

                        <h1 color='#727272'> Rep Token Management </h1>
                        <Box display="flex" justifyContent="flex-end" alignItems="center" >
                            <WalletDisplay address={address} disconnect={disconnect} />
                        </Box>
                    </Box>
                    <SecuritizeCreditVault></SecuritizeCreditVault>
                </>
            ) : (
                <Box textAlign="center">
                    Connect Your Wallet
                </Box>
            )}
        </Paper>
    );
}

export default SecuritizeCreditVaultApp;