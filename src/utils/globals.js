import ethereumIcon from '../assets/Ethereum.svg'; // Ethereum icon
import polygonIcon from '../assets/Polygon.svg';  // Polygon icon
import arbitrumIcon from '../assets/Arbitrum.svg'; // Arbitrum icon
import avalancheIcon from '../assets/Avalanche.svg'; // Avalanche icon
import optimismIcon from '../assets/Optimism.svg'; // Optimism icon
import baseIcon from '../assets/Base.svg'; // Base icon
import xdcIcon from '../assets/XDC.svg'; // XDC icon
import celoIcon from '../assets/Celo.svg'


//////////////////////////////////////////
//////////////////////////////////////////
////
//// Bridging Config
////
//////////////////////////////////////////
//////////////////////////////////////////

// Define the production version of the bridge
// false: Testing mode 
// true: Production mode
// If in testing mode, testnets will be shown in the network selector as well as the rest of components (e.g. Vault)
export const BRIDGE_PRODUCTION_VERSION = false; 

// Define the blockchain information
// This object contains the information for each blockchain
// The key is the blockchain name
// The value is an object containing the blockchain information
// Each blockchain object contains the following properties:
// - mainnet: Boolean indicating if the blockchain is the mainnet or a testnet
// - name: Name of the blockchain
// - chainId: Chain ID of the blockchain
// - rpcUrl: RPC URL of the blockchain
// - icon: Icon of the blockchain
// - wormholeChainId: Chain ID of the Wormhole network
// - bridgeContractAddress: Address of the bridge contract
// - assets: Array of assets on the blockchain
//   - address: Address of the asset
//   - name: Name of the asset
//   - symbol: Symbol of the asset
//   - icon: Icon of the asset

export const blockchainInfo = {
  // Ethereum Mainnet and Sepolia Testnet
  ethereum: {
    mainnet: true,
    name: "Ethereum",
    chainId: 1,
    rpcUrl: "https://mainnet.infura.io/v3/ac240982f9804e358d1f59fc60a5c451", // Replace with your RPC URL
    icon: ethereumIcon, // Variable representing the Ethereum icon
    wormholeChainId: 1,
    bridgeContractAddress: "0xcbB5B950A76B82Ec7982bABa99F5D4a92bA2288E",
    assets: [
      {
        address: "0x7712c34205737192402172409a8F7ccef8aA2AEc",
        name: "BUIDL",
        symbol: "BUIDL",
        icon: "https://s3.us-east-2.amazonaws.com/securitize-public-files/perm/8ca7c16b-de67-43f3-8d04-037bf2bd9c8d/0a6c7446-567e-4456-b722-f52f5cea942c-token-icon"
      },
    ]
  },
  ethereumSepolia: {
    mainnet: false,
    name: "Ethereum Sepolia",
    chainId: 11155111,
    rpcUrl: "https://sepolia.infura.io/v3/ac240982f9804e358d1f59fc60a5c451",
    icon: ethereumIcon, // Same variable for Sepolia testnet
  },

  // Polygon Mainnet and Amoy Testnet
  polygon: {
    mainnet: true,
    name: "Polygon",
    chainId: 137,
    rpcUrl: "https://polygon-mainnet.infura.io/v3/ac240982f9804e358d1f59fc60a5c451",
    icon: polygonIcon, // Variable representing the Polygon icon
    wormholeChainId: 5,
    bridgeContractAddress: "0xcbB5B950A76B82Ec7982bABa99F5D4a92bA2288E",
    assets: [
      {
        address: "0x2893Ef551B6dD69F661Ac00F11D93E5Dc5Dc0e99",
        name: "BUIDL",
        symbol: "BUIDL",
        icon: "https://s3.us-east-2.amazonaws.com/securitize-public-files/perm/8ca7c16b-de67-43f3-8d04-037bf2bd9c8d/0a6c7446-567e-4456-b722-f52f5cea942c-token-icon"
      },
    ]
  },
  polygonAmoy: {
    mainnet: false,
    name: "Polygon Amoy",
    chainId: 80002,
    rpcUrl: "https://rpc-amoy.polygon.technology",
    icon: polygonIcon,
    wormholeChainId: 10007,
    bridgeContractAddress: "0xA4280e41fAa1DDbE00275781C8baAc2aFa103bDc",
    assets: [
      {
        address: "0xf4bCF42f7BB98EA33210cC72c6EFB5D6Fa9A631F",
        name: "NOV5",
        symbol: "NOV5",
        icon: "https://s3.us-east-2.amazonaws.com/sandbox-public-files/perm/8202afe0-3a3c-4bd4-a8fc-53396b1e176d/7e5f9fe0-c188-46f1-ab3d-97f7c2f9cf42-token-icon"
      }
    ]
  },

  // Arbitrum Mainnet and Goerli Testnet
  arbitrum: {
    mainnet: true,
    name: "Arbitrum",
    chainId: 42161,
    rpcUrl: "https://arbitrum-mainnet.infura.io/v3/ac240982f9804e358d1f59fc60a5c451",
    icon: arbitrumIcon, // Variable representing the Arbitrum icon
    wormholeChainId: 23,
    bridgeContractAddress: "0xcbB5B950A76B82Ec7982bABa99F5D4a92bA2288E",
    assets: [
      {
        address: "0xA6525Ae43eDCd03dC08E775774dCAbd3bb925872",
        name: "BUIDL",
        symbol: "BUIDL",
        icon: "https://s3.us-east-2.amazonaws.com/securitize-public-files/perm/8ca7c16b-de67-43f3-8d04-037bf2bd9c8d/0a6c7446-567e-4456-b722-f52f5cea942c-token-icon"
      },
    ]
  },
  arbitrumSepolia: {
    mainnet: false,
    name: "Arbitrum Sepolia",
    chainId: 421614,
    rpcUrl: "https://arbitrum-sepolia.infura.io/v3/ac240982f9804e358d1f59fc60a5c451",
    icon: arbitrumIcon, // Same variable for Sepolia testnet
    wormholeChainId: 10003,
    bridgeContractAddress: "0x9e2Cc840CF4d163b1A9AfdBBeD11D04ACa91BC30",
    assets: [
      {
        address: "0x1A925055FA634A991f48e7827AD8B14c92D4581A",
        name: "NOV5",
        symbol: "NOV5",
        icon: "https://s3.us-east-2.amazonaws.com/sandbox-public-files/perm/8202afe0-3a3c-4bd4-a8fc-53396b1e176d/7e5f9fe0-c188-46f1-ab3d-97f7c2f9cf42-token-icon"
      },
      {
        address: "0x01695B0b5087597a85A4AB6bE0054f0Bd7c5312A",
        name: "TBAR",
        symbol: "TBAR",
        icon: "https://s3.us-east-2.amazonaws.com/sandbox-public-files/perm/8202afe0-3a3c-4bd4-a8fc-53396b1e176d/8c897c59-58ee-4f41-8ca0-c2e080704539-token-icon"
      },
    ]
  },

  // Avalanche Mainnet and Fuji Testnet
  avalanche: {
    mainnet: true,
    name: "Avalanche",
    chainId: 43114,
    rpcUrl: "https://avalanche-mainnet.infura.io/v3/ac240982f9804e358d1f59fc60a5c451",
    icon: avalancheIcon, // Variable representing the Avalanche icon
    wormholeChainId: 6,
    bridgeContractAddress: "0xcbB5B950A76B82Ec7982bABa99F5D4a92bA2288E",
    assets: [
      {
        address: "0x53FC82f14F009009b440a706e31c9021E1196A2F",
        name: "BUIDL",
        symbol: "BUIDL",
        icon: "https://s3.us-east-2.amazonaws.com/securitize-public-files/perm/8ca7c16b-de67-43f3-8d04-037bf2bd9c8d/0a6c7446-567e-4456-b722-f52f5cea942c-token-icon"
      },
    ]
  },
  avalancheFuji: {
    mainnet: false,
    name: "Avalanche Fuji",
    chainId: 43113,
    rpcUrl: "https://avalanche-fuji.infura.io/v3/ac240982f9804e358d1f59fc60a5c451",
    icon: avalancheIcon, // Same variable for Fuji testnet
    wormholeChainId: 6,
    // bridgeContractAddress: "0xA11e9c666ED79456951807334B290e0ee422D215",
    // bridgeContractAddress: "0x9281F9c872803cb6C5A3576dFba7210F23Ce24E4",
    bridgeContractAddress: "0xA4280e41fAa1DDbE00275781C8baAc2aFa103bDc",
    assets: [
      {
        address: "0x3454B9699fe19cf9219A3fe9D1F9956676eBA7Db",
        name: "NOV5",
        symbol: "NOV5",
        icon: "https://s3.us-east-2.amazonaws.com/sandbox-public-files/perm/8202afe0-3a3c-4bd4-a8fc-53396b1e176d/e3be35d8-40c8-43a3-aa00-3f6e23285941-token-icon"
      },
      {
        address: "0xdAD351E06D689f4A48F3033e2Ddcd3474ef89E8b",
        name: "TBAV",
        symbol: "TBAV",
        icon: "https://s3.us-east-2.amazonaws.com/sandbox-public-files/perm/8202afe0-3a3c-4bd4-a8fc-53396b1e176d/8c897c59-58ee-4f41-8ca0-c2e080704539-token-icon"
      }
    ]
  },

  // Optimism Mainnet and Sepolia Testnet
  optimism: {
    mainnet: true,
    name: "Optimism",
    chainId: 10,
    rpcUrl: "https://optimism-mainnet.infura.io/v3/ac240982f9804e358d1f59fc60a5c451",
    icon: optimismIcon, // Variable representing the Optimism icon
    wormholeChainId: 24,
    bridgeContractAddress: "0xcbB5B950A76B82Ec7982bABa99F5D4a92bA2288E",
    assets: [
      {
        address: "0xa1CDAb15bBA75a80dF4089CaFbA013e376957cF5",
        name: "BUIDL",
        symbol: "BUIDL",
        icon: "https://s3.us-east-2.amazonaws.com/securitize-public-files/perm/8ca7c16b-de67-43f3-8d04-037bf2bd9c8d/0a6c7446-567e-4456-b722-f52f5cea942c-token-icon"
      },
    ]
  },
  optimismSepolia: {
    mainnet: false,
    name: "Optimism Sepolia",
    chainId: 11155420,
    rpcUrl: "https://optimism-sepolia.infura.io/v3/ac240982f9804e358d1f59fc60a5c451",
    icon: optimismIcon, // Variable representing the Optimism icon
    wormholeChainId: 10005,

    // bridgeContractAddress: "0x8087c10b0B62C08533AdF59a58468f35ad94dD05 ",
    bridgeContractAddress: "0xA84793e88F4816cb82093b74532c3DA7791e276c",
    assets: [
      {
        address: "0xa42A16AAe02Fd5bD0CeAb2a84485B74289eCc877",
        name: "NOV5",
        symbol: "NOV5",
        icon: "https://s3.us-east-2.amazonaws.com/sandbox-public-files/perm/8202afe0-3a3c-4bd4-a8fc-53396b1e176d/e3be35d8-40c8-43a3-aa00-3f6e23285941-token-icon"
      },
      {
        address: "0x55AEF1F1fE0eA4BB7887d9AdB84714FAA0076B82",
        name: "AUG9",
        symbol: "AUG9",
        icon: "https://s3.us-east-2.amazonaws.com/sandbox-public-files/perm/8202afe0-3a3c-4bd4-a8fc-53396b1e176d/8c897c59-58ee-4f41-8ca0-c2e080704539-token-icon"
      },
      {
        address: "0xdAD351E06D689f4A48F3033e2Ddcd3474ef89E8b",
        name: "TBAV",
        symbol: "TBAV",
        icon: "https://s3.us-east-2.amazonaws.com/sandbox-public-files/perm/8202afe0-3a3c-4bd4-a8fc-53396b1e176d/8c897c59-58ee-4f41-8ca0-c2e080704539-token-icon"
      },

    ]
  },

  // Base Mainnet and Goerli Testnet
  base: {
    mainnet: true,
    name: "Base",
    chainId: 8453,
    rpcUrl: "https://mainnet.base.org",
    icon: baseIcon, // Variable representing the Base icon
  },

  baseGoerli: {
    mainnet: false,
    name: "Base Goerli Testnet",
    chainId: 84531,
    rpcUrl: "https://goerli.base.org",
    icon: baseIcon, // Same variable for Goerli testnet
  },

  // XDC Mainnet and Apothem Testnet
  xdc: {
    mainnet: true,
    name: "XDC Network",
    chainId: 50,
    rpcUrl: "https://rpc.xinfin.network",
    icon: xdcIcon, // Variable representing the XDC icon
  },
  xdcApothem: {
    mainnet: false,
    name: "XDC Apothem Testnet",
    chainId: 51,
    rpcUrl: "https://rpc.apothem.network",
    icon: xdcIcon, // Same variable for Apothem testnet
  },

  // Celo Mainnet and Alfajores Testnet
  celo: {
    mainnet: true,
    name: "Celo",
    chainId: 42220,
    rpcUrl: "https://forno.celo.org",
    icon: celoIcon, // Variable representing the Celo icon
  },
  celoAlfajores: {
    mainnet: false,
    name: "Celo Alfajores",
    chainId: 44787,
    rpcUrl: "https://alfajores-forno.celo-testnet.org",
    icon: celoIcon, // Same variable for Celo Alfajores testnet
    wormholeChainId: 14,
    // bridgeContractAddress: "0x2DBADe2AbFC04aB8a804C5cCDD6a5f0Ba61Db1b5",
    assets: [
      {
        address: "0xBF84d7D218dD971e9648Ca39F62fE2164656a365",
        name: "AUG9",
        symbol: "AUG9",
        icon: "https://s3.us-east-2.amazonaws.com/sandbox-public-files/perm/8202afe0-3a3c-4bd4-a8fc-53396b1e176d/8c897c59-58ee-4f41-8ca0-c2e080704539-token-icon"
      },
    ]
  },
};


//////////////////////////////////////////
//////////////////////////////////////////
////
//// Wallet Connect Config
////
//////////////////////////////////////////
//////////////////////////////////////////

// Wallet Connect Config
// Define the target blockchain configuration for WalletConnect
// This array contains the configuration for each target blockchain
// Each object contains the following properties:
// - chainId: Chain ID of the blockchain
// - name: Name of the blockchain
// - currency: Currency of the blockchain
// - explorerUrl: URL of the blockchain explorer
// - rpcUrl: RPC URL of the blockchain

export const walletConnectTargetBlockchainConfig = [
  {
    chainId: 1,
    name: 'Ethereum Mainnet',
    currency: 'ETH',
    explorerUrl: 'hhttps://etherscan.io/',
    rpcUrl: 'https://mainnet.infura.io/v3/ac240982f9804e358d1f59fc60a5c451'
  },
  {
    chainId: 137,
    name: 'Polygon Mainnet',
    currency: 'MATIC',
    explorerUrl: 'https://polygonscan.com/',
    rpcUrl: 'https://polygon-mainnet.infura.io/v3/ac240982f9804e358d1f59fc60a5c451'
  },
  {
    chainId: 43114,
    name: 'Avalanche Mainnet',
    currency: 'AVAX',
    explorerUrl: 'https://snowtrace.io/',
    rpcUrl: 'https://avalanche-mainnet.infura.io/v3/ac240982f9804e358d1f59fc60a5c451'
  },
  {
    chainId: 42161,
    name: 'Arbitrum One',
    currency: 'ETH',
    explorerUrl: 'https://arbiscan.io/',
    rpcUrl: 'https://arbitrum-mainnet.infura.io/v3/ac240982f9804e358d1f59fc60a5c451'
  },
  {
    chainId: 10,
    name: 'Optimism Mainnet',
    currency: 'ETH',
    explorerUrl: 'https://optimistic.etherscan.io/',
    rpcUrl: 'https://optimism-mainnet.infura.io/v3/ac240982f9804e358d1f59fc60a5c451'
  },
  {
    chainId: 43113,
    name: 'Avalanche Fuji Testnet',
    currency: 'AVAX',
    explorerUrl: 'https://testnet.snowtrace.io',
    rpcUrl: 'https://avalanche-fuji.infura.io/v3/ac240982f9804e358d1f59fc60a5c451'
  },
  {
    chainId: 44787,
    name: 'Celo Alfajores',
    currency: 'CELO',
    explorerUrl: 'https://alfajores.celoscan.io/',
    rpcUrl: 'https://alfajores-forno.celo-testnet.org'
  },
  {
    chainId: 421614,
    name: 'Arbitrum Sepolia',
    currency: 'ETH',
    explorerUrl: 'https://sepolia.arbiscan.io/',
    rpcUrl: 'https://arbitrum-sepolia.infura.io/v3/ac240982f9804e358d1f59fc60a5c451'
  },
  {
    chainId: 11155420,
    name: 'Optimism Sepolia',
    currency: 'ETH',
    explorerUrl: 'https://sepolia-optimism.etherscan.io/',
    rpcUrl: 'https://optimism-sepolia.infura.io/v3/ac240982f9804e358d1f59fc60a5c451'
  },
  {
    chainId: 80002,
    name: 'Polygon Amoy',
    currency: 'MATIC',
    explorerUrl: 'https://amoy.polygonscan.com/',
    rpcUrl: 'https://rpc-amoy.polygon.technology'
  },
]
export const walletConnectMetadata = {
  name: 'Securitize Bridge',
  description: 'Securitize Bridge for BUIDL',
  url: 'https://web3.hoolynk.com', // origin must match your domain & subdomain
  icons: ['https://s3.us-east-2.amazonaws.com/securitize-public-files/perm/8ca7c16b-de67-43f3-8d04-037bf2bd9c8d/0a6c7446-567e-4456-b722-f52f5cea942c-token-icon']
}

export const walletConnectProjectId = '9d05d4b1b35fad1c007771dc63f9911d'





//////////////////////////////////////////
//////////////////////////////////////////
////
//// Vault Config
////
//////////////////////////////////////////
//////////////////////////////////////////

// // For Vault in Mainnet
// // export const VaultAddress = "0x4535B360b4907b44B27cd499e07Ed7772b723deA"; // First deployment
// export const VaultAddress = "0x07a36C630e3F072637da3445Da733B29958D8cAB"; 
// export const AssetAddress = "0x7712c34205737192402172409a8F7ccef8aA2AEc";
// export const AssetName = "BUIDL";
// export const RepresentationTokenName = "sBUIDL";
// export const TargetBlockchainChainId = 1;

// export const walletConnectTargetBlockchainConfig = [{
//   chainId: 1,
//   name: 'Ethereum Mainnet',
//   currency: 'ETH',
//   explorerUrl: 'https://etherscan.io',
//   rpcUrl: 'https://mainnet.infura.io/v3/ac240982f9804e358d1f59fc60a5c451'
// }]

// For Vault in Testnets
export const VaultAddress = "0x602B85F6e27656d2897fF6984896d9af7661939f";
export const AssetAddress = "0x71dB752c6642bb1CeD83c48C43C7A9E003F36AA1";
export const AssetName = "TA AVA";
export const RepresentationTokenName = "szTAAVA";
export const TargetBlockchainChainId = 43113;

