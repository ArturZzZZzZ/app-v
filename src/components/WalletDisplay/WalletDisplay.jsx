import { useEffect, useState } from 'react';
import { Box, Chip, IconButton, Typography, Tooltip, Menu, MenuItem, ListItemIcon, ListItemText, Button } from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import { useWeb3Modal, useDisconnect, useWeb3ModalAccount } from '@web3modal/ethers/react';

import { defaultConfig, createWeb3Modal } from '@web3modal/ethers/react';
import { TargetBlockchainChainId, walletConnectMetadata, walletConnectProjectId, walletConnectTargetBlockchainConfig } from './WalletConnectConfig';

export const initializeWeb3Modal = () => {
  try {
    const ethersConfig = defaultConfig({
      metadata: walletConnectMetadata,
      enableEIP6963: true,
      enableInjected: true,
      enableCoinbase: true,
      rpcUrl: '...',
      defaultChainId: TargetBlockchainChainId,
    });

    return createWeb3Modal({
      ethersConfig,
      chains: walletConnectTargetBlockchainConfig,
      projectId: walletConnectProjectId,
      enableAnalytics: true,
    });
  } catch (error) {
    console.error('Failed to create Web3Modal instance:', error);
    return null;
  }
};

initializeWeb3Modal();

const WalletDisplay = () => {
  const [copied, setCopied] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const { open } = useWeb3Modal(); // Access the open function from useWeb3Modal
  const { isConnected } = useWeb3ModalAccount();
  const { address } = useWeb3ModalAccount();
  const { disconnect } = useDisconnect();
  useEffect(() => {
    console.log("Wallet Disconnected: ", address);
    console.log("Wallet Connected: ", isConnected);
    const handleAccountsChanged = (accounts) => {
      if (!accounts.length || accounts[0] !== address) {
        disconnect();
      }
    };

    if (window.ethereum) {
      window.ethereum.on('accountsChanged', handleAccountsChanged);
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      }
    };
  }, [address, disconnect]);

  const handleCopy = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleChipClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleDisconnect = () => {
    handleMenuClose();
    disconnect();
  };

  if (!address) {
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

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
      <Typography variant="h6" component="div" sx={{ display: 'flex', alignItems: 'center', gap: 0 }}>
        <Chip
          label={`${address.slice(0, 6)}...${address.slice(-4)}`}
          size="small"
          sx={{ fontSize: '0.75rem', padding: '0 5px', cursor: 'pointer', color: 'white', backgroundColor: 'grey' }}
          onClick={handleChipClick}
        />
        <Tooltip title={copied ? "Copied!" : "Copy to clipboard"} arrow>
          <IconButton onClick={handleCopy} size="small" sx={{ ml: 0, color: "#fff" }}>
            <ContentCopyIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Typography>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
      >
        <MenuItem onClick={handleDisconnect}>
          <ListItemIcon>
            <ExitToAppIcon fontSize="small" color="warning" />
          </ListItemIcon>
          <ListItemText primary="Disconnect" />
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default WalletDisplay;
