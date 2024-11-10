import { TargetBlockchainChainId } from '../../../utils/globals';

import React, { useEffect, useState } from 'react';
import { createWeb3Modal, defaultConfig } from '@web3modal/ethers/react';
import { useWeb3Modal, useDisconnect } from '@web3modal/ethers/react';
import { Button, Typography, Box, Container, Paper, Tabs, Tab } from '@mui/material';
import { useWeb3ModalProvider, useWeb3ModalAccount } from '@web3modal/ethers/react';
import { ethers } from 'ethers';
import { VaultAddress } from '../../../utils/globals';
import { VaultABI } from '../../../utils/ABIs';

import VaultTransaction from './VaultTransaction';
import VaultAdmin from './VaultAdmin';
import WalletDisplay from '../../WalletDisplay/WalletDisplay';
import SmartContractInterface from './SmartContractInterfaces';
import { useSwitchNetwork } from '@web3modal/ethers/react';

function SecuritizeCreditVault() {
  const { address, chainId, isConnected } = useWeb3ModalAccount();
  const { disconnect } = useDisconnect();
  const { provider, setProvider } = useWeb3ModalProvider();
  const { walletProvider } = useWeb3ModalProvider();

  const isOnCorrectBlockchain = chainId === TargetBlockchainChainId;
  const [isAdmin, setIsAdmin] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const { switchNetwork } = useSwitchNetwork();
  const [buttonLabelStatus, setButtonLabelStatus] = useState("Switch");


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

  async function handleSwitchNetwork() {
    // Check and switch network if needed
    try {
      if (TargetBlockchainChainId !== chainId) {
        setButtonLabelStatus("Switching to correct blockchain");
        await switchNetwork(TargetBlockchainChainId);
        setButtonLabelStatus("Switch");
      }
    } catch (e) {
      setButtonLabelStatus("Switch"); // Probably cancelled by user
    }
  }

  return (
    // <Container className="SecuritizeCreditVault" >
    <  >
      {isOnCorrectBlockchain ? (
        <>
          <Box elevation={3} sx={{ padding: '16px', textAlign: 'center' }}>
            <Tabs value={tabValue} onChange={handleTabChange} centered>
              <Tab label="Vault Transaction" />
              {isAdmin && <Tab label="Vault Admin" />}
              {isAdmin && <Tab label="Smart Contract Interface" />}
            </Tabs>
            <Box sx={{ mt: 3 }}>
              {tabValue === 0 && <VaultTransaction action="deposit" />}
              {isAdmin && tabValue === 1 && <VaultAdmin />}
              {isAdmin && tabValue === 2 && <SmartContractInterface />}
            </Box>
          </Box>
        </>
      ) : (
        <Paper elevation={3} sx={{ padding: '16px', textAlign: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexDirection:'column' }}>
            <Typography variant="h6" color="error">
              Please switch to target network
            </Typography>
            <Button
              variant="contained"
              color="primary"
              onClick={handleSwitchNetwork}> {buttonLabelStatus}
            </Button>
          </Box>
        </Paper>
      )}
    </>
  );
}

export default SecuritizeCreditVault;