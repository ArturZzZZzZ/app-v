import '@fontsource/roboto';
import React, { useState, useEffect } from 'react';
import { Box, AppBar, Toolbar, Button, Switch, Typography } from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';

import theme from './utils/theme';
import WalletDisplay from './components/WalletDisplay/WalletDisplay';
import { blockchainInfo } from './utils/globals';
import { initializeWeb3Modal } from './utils/Web3ModalConfig';
import Bridge from './components/Bridge/Bridge';
import SecuritizeCreditVault from './components/SecuritizeCreditVault/components/SecuritizeCreditVault';

import { BRIDGE_PRODUCTION_VERSION } from './utils/globals';
import { useAppContext } from './utils/AppContext';

// Initialize Web3Modal
initializeWeb3Modal();

const App = () => {
  const [selectedView, setSelectedView] = useState(0);
  const { showMainNets, setShowMainNets } = useAppContext();
  const [sourceNetwork, setSourceNetwork] = useState(showMainNets ? blockchainInfo.ethereum : blockchainInfo.avalancheFuji);
  const [targetNetwork, setTargetNetwork] = useState(showMainNets ? blockchainInfo.avalanche : blockchainInfo.optimismSepolia);

  const handleToggleNetwork = (event) => {
    setShowMainNets(event.target.checked);
  };

  // Define views based on the BRIDGE_PRODUCTION_VERSION flag
  const views = BRIDGE_PRODUCTION_VERSION
    ? [
        {
          label: "BUIDL Bridge",
          component: (
            <Bridge
              network1={sourceNetwork}
              network2={targetNetwork}
            />
          ),
        }
      ]
    : [
        {
          label: "Vault",
          component: <SecuritizeCreditVault />
        },
        {
          label: "Bridge",
          component: (
            <Bridge
              network1={sourceNetwork}
              network2={targetNetwork}
            />
          ),
        },
      ];

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
          <Box sx={{ display: 'flex', gap: 2 }}>
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
          {!BRIDGE_PRODUCTION_VERSION && selectedView === views.findIndex(view => view.label === "Bridge") && (
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
          )}
          <WalletDisplay />
        </Toolbar>
      </AppBar>
      <Box>{views[selectedView].component}</Box>
    </ThemeProvider>
  );
};

export default App;