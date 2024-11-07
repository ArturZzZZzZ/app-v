import '@fontsource/roboto'; // Defaults to weight 400.
import { TargetBlockchainChainId, walletConnectMetadata, walletConnectProjectId, walletConnectTargetBlockchainConfig, blockchainInfo, IS_TESTNET } from './utils/globals';

import React, { useEffect, useState } from 'react';
import { createWeb3Modal, defaultConfig } from '@web3modal/ethers/react';
import { useWeb3Modal, useDisconnect } from '@web3modal/ethers/react';
import { useWeb3ModalProvider, useWeb3ModalAccount } from '@web3modal/ethers/react';
import { Button, Typography, Box, Container, Paper, AppBar, Toolbar, MenuItem, Menu } from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { purple, green } from '@mui/material/colors';

import Bridge from './components/Bridge/components/Bridge';
import SecuritizeCreditVault from './components/SecuritizeCreditVault/components/SecuritizeCreditVault';
import SecuritizeCreditVaultApp from './components/SecuritizeCreditVault/CreditVaultApp';
import WalletDisplay from './utils/WalletDisplay';
import BridgeApp from './components/Bridge/BrigeApp';
import EditableTable from './components/InvestorIngest/EditableTable';


try {
  // Create Ethers config
  const ethersConfig = defaultConfig({
    metadata: walletConnectMetadata,
    enableEIP6963: true,
    enableInjected: true,
    enableCoinbase: true,
    rpcUrl: '...',
    defaultChainId: TargetBlockchainChainId,
  });

  // Create a AppKit instance
  const web3modal= createWeb3Modal({
    ethersConfig,
    chains: walletConnectTargetBlockchainConfig,
    projectId: walletConnectProjectId,
    enableAnalytics: true,
  });

  console.log('Web3Modal instance created successfully',web3modal );

} catch (error) {
  console.error('Failed to create Web3Modal instance:', error);
}

const theme = createTheme({
  palette: {
    primary: {
      // main: purple[500],  // Customize primary button color
      main: "#3b3d5b",  // Customize primary button color
      // backgroundColor: "#3b3d5b",

    },
    secondary: {
      main: green[500],  // Customize secondary button color
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '8px', // Example of adding a custom style
        },
        containedPrimary: {
          // backgroundColor: purple[500],
          color: '#fff',
          '&:hover': {
            backgroundColor: purple[700],
          },
        },
        containedSecondary: {
          backgroundColor: green[500],
          color: '#fff',
          '&:hover': {
            backgroundColor: green[700],
          },
        },
        outlinedPrimary: {
          borderColor: purple[500],
          color: purple[500],
          '&:hover': {
            borderColor: purple[700],
            color: purple[700],
          },
        },
        outlinedSecondary: {
          borderColor: green[500],
          color: green[500],
          '&:hover': {
            borderColor: green[700],
            color: green[700],
          },
        },
      },
    },
  },
});


function ConnectButton() {
  const { open } = useWeb3Modal();

  return (
    <Button
      variant="contained"
      color="primary"
      onClick={() => open({})}
      sx={{
        ':hover': {
          backgroundColor: 'primary.dark',
        },
      }}
    >
      Connect Wallet
    </Button>
  );
}

function App() {
  const { isConnected } = useWeb3ModalAccount();
  const { address } = useWeb3ModalAccount();
  const { disconnect } = useDisconnect();

  const [selectedView, setSelectedView] = useState(1); // State to control selected view

  // Function to handle view change
  const handleViewChange = (view) => {
    setSelectedView(view);
  };

  return (
    <ThemeProvider theme={theme}>
      <>
        <AppBar position="sticky" sx={{ backgroundColor: 'grey', marginBottom: '12px' }}>
          <Toolbar sx={{ justifyContent: 'space-between', backgroundColor: "#2b2d42" }}>
            {true ? (
              <>
                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-start' }}>
                  BUILD Bridge
                  {/* <Button
                    color="inherit"
                    onClick={() => handleViewChange(0)}
                    sx={{
                      backgroundColor: selectedView === 0 ? 'primary.main' : 'inherit',
                      color: selectedView === 0 ? 'white' : 'inherit',
                      ':hover': {
                        backgroundColor: selectedView === 0 ? 'primary.dark' : 'grey.300',
                      },
                    }}
                  >
                    Vault
                  </Button> */}
                  {/* <Button
                    color="inherit"
                    onClick={() => handleViewChange(1)}
                    sx={{
                      backgroundColor: selectedView === 1 ? 'primary.main' : 'inherit',
                      color: selectedView === 1 ? 'white' : 'inherit',
                      ':hover': {
                        backgroundColor: selectedView === 1 ? 'primary.dark' : 'grey.300',
                      },
                    }}
                  >
                    Bridge
                  </Button> */}
                  {/* <Button
                    color="inherit"
                    onClick={() => handleViewChange(2)}
                    sx={{
                      backgroundColor: selectedView === 2 ? 'primary.main' : 'inherit',
                      color: selectedView === 2 ? 'white' : 'inherit',
                      ':hover': {
                        backgroundColor: selectedView === 1 ? 'primary.dark' : 'grey.300',
                      },
                    }}
                  >
                    Investor Ingest
                  </Button> */}
                </Box>
                <Box>
                  <WalletDisplay address={address} disconnect={disconnect} />
                </Box>
              </>
            ) : (<> Securitize Dev </>)}
          </Toolbar>
        </AppBar>

        {true ? (
          <Box >
            {/* {selectedView === 0 && <SecuritizeCreditVault />} */}
            {/* {selectedView === 1 && <Bridge network1={blockchainInfo.ethereum} network2={blockchainInfo.avalanche} />} */}
            {selectedView === 1 && <Bridge network1={IS_TESTNET ? blockchainInfo.avalancheFuji : blockchainInfo.ethereum} network2={IS_TESTNET ? blockchainInfo.optimismSepolia : blockchainInfo.avalanche} />}
            {/* {selectedView === 2 && <EditableTable />} */}
          </Box>
        ) : (
          <Box textAlign="center">
            <ConnectButton />
          </Box>
        )}
      </>
      {/* {isConnected ? (
        <Box >
          <SecuritizeCreditVaultApp></SecuritizeCreditVaultApp>
        </Box>
      ) : (
        <Box textAlign="center">
          <ConnectButton />
        </Box>
      )}
      <BridgeApp network1={blockchainInfo.avalancheFuji} network2={blockchainInfo.celoAlfajores}></BridgeApp> */}
    </ThemeProvider>
  );
}

export default App;