import '@fontsource/roboto';
import React, { useState, useEffect } from 'react';
import { Box, AppBar, Toolbar, Button, Switch, Typography } from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';

import theme from './utils/theme';
import WalletDisplay from './components/WalletDisplay/WalletDisplay';
import { blockchainInfo } from './utils/globals';
import Bridge from './components/Bridge/Bridge';
import SecuritizeCreditVault from './components/SecuritizeCreditVault/SecuritizeCreditVault';

import { BRIDGE_PRODUCTION_VERSION, VAULT_PRODUCTION_VERSION, TEST_VERSION } from './utils/globals';
import { useAppContext } from './utils/AppContext';

const App = () => {
  const [selectedView, setSelectedView] = useState(0);
  const { showMainNets, setShowMainNets } = useAppContext();
  const [sourceNetwork, setSourceNetwork] = useState(showMainNets ? blockchainInfo.ethereum : blockchainInfo.avalancheFuji);
  const [targetNetwork, setTargetNetwork] = useState(showMainNets ? blockchainInfo.avalanche : blockchainInfo.optimismSepolia);

  const handleToggleNetwork = (event) => {
    setShowMainNets(event.target.checked);
  };


  // Define the views based on the application version and environment
  const views = TEST_VERSION
    ? [
        // If in test version, show both Vault and Bridge views
        {
          label: "Vault",
          component: <SecuritizeCreditVault />, // Vault component
        },
        {
          label: "Bridge",
          component: (
            <Bridge network1={sourceNetwork} network2={targetNetwork} /> // Bridge component with dynamic networks
          ),
        },
      ]
    : VAULT_PRODUCTION_VERSION
      ? [
          // If in production and Vault version, show only the Vault view
          {
            label: "Vault",
            component: <SecuritizeCreditVault />, // Vault component
          },
        ]
      : BRIDGE_PRODUCTION_VERSION
        ? [
            // If in production and Bridge version, show only the Bridge view
            {
              label: "BUIDL Bridge",
              component: (
                <Bridge network1={sourceNetwork} network2={targetNetwork} /> // Bridge component with dynamic networks
              ),
            },
          ]
        : [
            // Default case: show both Vault and Bridge views
            {
              label: "Vault",
              component: <SecuritizeCreditVault />, // Vault component
            },
            {
              label: "Bridge",
              component: (
                <Bridge network1={sourceNetwork} network2={targetNetwork} /> // Bridge component with dynamic networks
              ),
            },
          ];

  // Set the source and target networks based on the showMainNets flag
  useEffect(() => {
    if (showMainNets) {
      setSourceNetwork(blockchainInfo.ethereum);
      setTargetNetwork(blockchainInfo.avalanche);
    } else {
      setSourceNetwork(blockchainInfo.avalancheFuji);
      setTargetNetwork(blockchainInfo.optimismSepolia);
    }
  }, [showMainNets]);

  return (
    <ThemeProvider theme={theme}>
      <AppBar position="sticky" sx={{ backgroundColor: 'grey', marginBottom: '12px' }}>
        <Toolbar sx={{ justifyContent: 'space-between', backgroundColor: "#2b2d42" }}>
          {TEST_VERSION && (
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>

                {views.map((view, index) => (
                  <Button
                    variant='contained'
                    key={index}
                    className={selectedView === index ? 'Mui-selected' : ''}
                    color="primary"
                    onClick={() => setSelectedView(index)}
                    sx={{
                      backgroundColor: selectedView === index ? 'primary.main' : 'inherit',
                      color: selectedView === index ? 'white' : 'inherit',
                      ':hover': {
                        backgroundColor: selectedView === index ? 'primary.dark' : 'grey.300',
                      },
                    }}
                  >
                    {view.label}
                  </Button>
                ))}
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="body2">
                  {showMainNets ? 'Main Nets' : 'Test Nets'}
                </Typography>
                <Switch
                  checked={showMainNets}
                  onChange={handleToggleNetwork}
                  color="primary"
                  inputProps={{ 'aria-label': 'Toggle between main nets and test nets' }}
                />
              </Box>
            </Box>
          )}
          <Box sx={{ ml: "auto", display: "flex", gap: 2 }}>
            <WalletDisplay />
            <WalletDisplay networkKey='solana' />
          </Box>
        </Toolbar>
      </AppBar>
      <Box>{views[selectedView].component}</Box>
    </ThemeProvider>
  );
};

export default App;