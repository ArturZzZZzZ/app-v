import '@fontsource/roboto';
import React, { useState } from 'react';
import { Box, AppBar, Toolbar, Button } from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';

import theme from './utils/theme';
import WalletDisplay from './components/WalletDisplay/WalletDisplay';
import { blockchainInfo, IS_TESTNET } from './utils/globals';
import { initializeWeb3Modal } from './utils/Web3ModalConfig';
import Bridge from './components/Bridge/Bridge';
import SecuritizeCreditVault from './components/SecuritizeCreditVault/components/SecuritizeCreditVault';

// Initialize Web3Modal
initializeWeb3Modal();

const App = () => {
  const [selectedView, setSelectedView] = useState(1);

  const views = [
    {
      label: "Vault",
      component:
        <SecuritizeCreditVault />
    },
    {
      label: "Bridge",
      component: (
        <Bridge
          network1={IS_TESTNET ? blockchainInfo.avalancheFuji : blockchainInfo.ethereum}
          network2={IS_TESTNET ? blockchainInfo.optimismSepolia : blockchainInfo.avalanche}
        />
      ),
    },
  ];

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
          <WalletDisplay />
        </Toolbar>
      </AppBar>
      <Box>{views[selectedView].component}</Box>
    </ThemeProvider>
  );
};

export default App;