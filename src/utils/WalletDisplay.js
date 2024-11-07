// // import { Box, Chip, IconButton, Typography, Tooltip, Menu, MenuItem, ListItemIcon, ListItemText } from '@mui/material';
// // import ContentCopyIcon from '@mui/icons-material/ContentCopy';
// // import ExitToAppIcon from '@mui/icons-material/ExitToApp'; // Icon for disconnect
// // import { useState } from 'react';

// // const WalletDisplay = ({ address, disconnect }) => {
// //   const [copied, setCopied] = useState(false);
// //   const [anchorEl, setAnchorEl] = useState(null);

// //   const handleCopy = () => {
// //     if (address) {
// //       navigator.clipboard.writeText(address);
// //       setCopied(true);
// //       setTimeout(() => setCopied(false), 2000); // Reset the copied state after 2 seconds
// //     }
// //   };

// //   const handleChipClick = (event) => {
// //     setAnchorEl(event.currentTarget);
// //   };

// //   const handleMenuClose = () => {
// //     setAnchorEl(null);
// //   };

// //   const handleDisconnect = () => {
// //     handleMenuClose();
// //     disconnect();
// //   };

// //   if (!address) {
// //     return null; // or you can return a placeholder like "No address connected"
// //   }

// //   return (
// //     <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
// //       <Typography variant="h6" component="div" sx={{ display: 'flex', alignItems: 'center', gap: 0 }}>
// //         <Chip 
// //           label={`${address.slice(0, 6)}...${address.slice(-4)}`} 
// //           size="small" 
// //           sx={{ fontSize: '0.75rem', padding: '0 5px', cursor: 'pointer', color:'white', backgroundColor:"grey" }} 
// //           onClick={handleChipClick}
// //         />
// //         <Tooltip title={copied ? "Copied!" : "Copy to clipboard"} arrow>
// //           <IconButton onClick={handleCopy} size="small" sx={{ ml: 0, color:"#fff" }}>
// //             <ContentCopyIcon fontSize="small" />
// //           </IconButton>
// //         </Tooltip>
// //       </Typography>

// //       <Menu
// //         anchorEl={anchorEl}
// //         open={Boolean(anchorEl)}
// //         onClose={handleMenuClose}
// //         anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
// //         transformOrigin={{ vertical: 'top', horizontal: 'left' }}
// //       >
// //         <MenuItem onClick={handleDisconnect} >
// //           <ListItemIcon >
// //             <ExitToAppIcon fontSize="small" color='warning'/>
// //           </ListItemIcon>
// //           <ListItemText primary="Disconnect" />
// //         </MenuItem>
// //       </Menu>
// //     </Box>
// //   );
// // };

// // export default WalletDisplay;

// import { useEffect, useState } from 'react';
// import { Box, Chip, IconButton, Typography, Tooltip, Menu, MenuItem, ListItemIcon, ListItemText } from '@mui/material';
// import ContentCopyIcon from '@mui/icons-material/ContentCopy';
// import ExitToAppIcon from '@mui/icons-material/ExitToApp';

// const WalletDisplay = ({ address, disconnect }) => {
//   const [copied, setCopied] = useState(false);
//   const [anchorEl, setAnchorEl] = useState(null);

//   useEffect(() => {
//     const handleAccountsChanged = (accounts) => {
//       if (!accounts.length || accounts[0] !== address) {
//         disconnect();
//       }
//     };

//     if (window.ethereum) {
//       window.ethereum.on('accountsChanged', handleAccountsChanged);
//     }

//     return () => {
//       if (window.ethereum) {
//         window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
//       }
//     };
//   }, [address, disconnect]);

//   const handleCopy = () => {
//     if (address) {
//       navigator.clipboard.writeText(address);
//       setCopied(true);
//       setTimeout(() => setCopied(false), 2000);
//     }
//   };

//   const handleChipClick = (event) => {
//     setAnchorEl(event.currentTarget);
//   };

//   const handleMenuClose = () => {
//     setAnchorEl(null);
//   };

//   const handleDisconnect = () => {
//     handleMenuClose();
//     disconnect();
//   };

//   if (!address) {
//     return null;
//   }

//   return (
//     <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
//       <Typography variant="h6" component="div" sx={{ display: 'flex', alignItems: 'center', gap: 0 }}>
//         <Chip 
//           label={`${address.slice(0, 6)}...${address.slice(-4)}`} 
//           size="small" 
//           sx={{ fontSize: '0.75rem', padding: '0 5px', cursor: 'pointer', color: 'white', backgroundColor: 'grey' }} 
//           onClick={handleChipClick}
//         />
//         <Tooltip title={copied ? "Copied!" : "Copy to clipboard"} arrow>
//           <IconButton onClick={handleCopy} size="small" sx={{ ml: 0, color: "#fff" }}>
//             <ContentCopyIcon fontSize="small" />
//           </IconButton>
//         </Tooltip>
//       </Typography>

//       <Menu
//         anchorEl={anchorEl}
//         open={Boolean(anchorEl)}
//         onClose={handleMenuClose}
//         anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
//         transformOrigin={{ vertical: 'top', horizontal: 'left' }}
//       >
//         <MenuItem onClick={handleDisconnect}>
//           <ListItemIcon>
//             <ExitToAppIcon fontSize="small" color="warning" />
//           </ListItemIcon>
//           <ListItemText primary="Disconnect" />
//         </MenuItem>
//       </Menu>
//     </Box>
//   );
// };

// export default WalletDisplay;

import { useEffect, useState } from 'react';
import { Box, Chip, IconButton, Typography, Tooltip, Menu, MenuItem, ListItemIcon, ListItemText, Button } from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import { useWeb3Modal, useDisconnect, useWeb3ModalAccount } from '@web3modal/ethers/react';

const WalletDisplay = ({ address, disconnect }) => {
  const [copied, setCopied] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const { open } = useWeb3Modal(); // Access the open function from useWeb3Modal
  const { isConnected } = useWeb3ModalAccount();

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
