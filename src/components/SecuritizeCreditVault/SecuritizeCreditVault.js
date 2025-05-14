// import { TargetBlockchainChainId } from '../../../utils/globals';

import React, { useEffect, useState } from 'react';
import { useWeb3Modal, useDisconnect } from '@web3modal/ethers/react';
import { Button, Typography, Box, Container, Paper, Tabs, Tab } from '@mui/material';
import { useWeb3ModalProvider, useWeb3ModalAccount } from '@web3modal/ethers/react';
import { ethers } from 'ethers';
// import { VaultAddress } from '../../../utils/globals';
import { VaultABI } from '../../utils/ABIs';

import VaultTransaction from './components/VaultTransaction';
import VaultAdmin from './components/VaultAdmin';
import WalletDisplay from '../WalletDisplay/WalletDisplay';
import SmartContractInterface from './components/SmartContractInterfaces';
import { useSwitchNetwork } from '@web3modal/ethers/react';
import BlockchainSwitcher from './components/BlockchainSwitcher';

import { useAppContext } from '../../utils/AppContext'; // Import AppContext.js
import AssetDisplay from '../Bridge/components/AssetDisplay';
import AssetSwitcher from './components/AssetSwitcher';

function SecuritizeCreditVault() {
  const { address, chainId, isConnected } = useWeb3ModalAccount();
  const { disconnect } = useDisconnect();
  const { provider, setProvider } = useWeb3ModalProvider();
  const { walletProvider } = useWeb3ModalProvider();

  const [isAdmin, setIsAdmin] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const { switchNetwork } = useSwitchNetwork();
  const [buttonLabelStatus, setButtonLabelStatus] = useState("Switch");

  const { vaultAddress, setVaultAddress } = useAppContext();
  const { vaultAssetAddress, setVaultAssetAddress } = useAppContext();
  const { TargetBlockchainChainId, setTargetBlockchainChainId } = useAppContext();

  const VaultAddress = vaultAddress;

  const isOnCorrectBlockchain = chainId === TargetBlockchainChainId;

  const {selectedAsset} = useAppContext();

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
    <>
      {/* <AssetDisplay onAssetChange={setSelectedAsset} /> */}
      <AssetSwitcher />
      {/* <BlockchainSwitcher /> */}
      {/* {isOnCorrectBlockchain ? ( */}
      {selectedAsset ? (

        <>
          <Box elevation={3} sx={{ padding: '16px', textAlign: 'center' }}>
            <Tabs value={tabValue} onChange={handleTabChange} centered>
              <Tab label="Vault Transaction" />
              {<Tab label="Vault Admin" />}
              {<Tab label="Smart Contract Interface" />}
            </Tabs>
            <Box sx={{ mt: 3 }}>
              {tabValue === 0 && <VaultTransaction action="deposit" />}
              {tabValue === 1 && <VaultAdmin />}
              {tabValue === 2 && <SmartContractInterface />}
            </Box>
          </Box>
        </>
      ) : (<> </>)}

    </>
  );
}

export default SecuritizeCreditVault;

