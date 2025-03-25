import ethereumIcon from '../assets/Ethereum.svg'; // Ethereum icon
import polygonIcon from '../assets/Polygon.svg';  // Polygon icon
import arbitrumIcon from '../assets/Arbitrum.svg'; // Arbitrum icon
import avalancheIcon from '../assets/Avalanche.svg'; // Avalanche icon
import optimismIcon from '../assets/Optimism.svg'; // Optimism icon
import baseIcon from '../assets/Base.svg'; // Base icon
import xdcIcon from '../assets/XDC.svg'; // XDC icon
import celoIcon from '../assets/Celo.svg'
import inkChainIcon from '../assets/InkChain.svg'; // InkChain icon

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

// ONLY ONE OF THE FOLLOWING VARIABLES SHOULD BE TRUE
export const BRIDGE_PRODUCTION_VERSION = true;
export const VAULT_PRODUCTION_VERSION = false;
export const TEST_VERSION = false;

const INFURA_PROJECT_ID = 'ac240982f9804e358d1f59fc60a5c451';  // Miguel's Infura Project ID
// const INFURA_PROJECT_ID = '7ca398da04ce4502b8697478309756bf'; // Chema Infura Project ID

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
    nativeCurrencySymbol: "ETH",
    chainId: 1,
    rpcUrl: "https://mainnet.infura.io/v3/" + INFURA_PROJECT_ID, // Replace with your RPC URL
    icon: ethereumIcon, // Variable representing the Ethereum icon
    // BUIDL
    // vaultAddress: "0x07a36C630e3F072637da3445Da733B29958D8cAB",
    // vaultAssetAddress: "0x7712c34205737192402172409a8F7ccef8aA2AEc",
    wormholeChainId: 2,
    // bridgeContractAddress: "0xcbB5B950A76B82Ec7982bABa99F5D4a92bA2288E",
    assets: [
      {
        bridgeContractAddress: "0xcbB5B950A76B82Ec7982bABa99F5D4a92bA2288E",
        address: "0x7712c34205737192402172409a8F7ccef8aA2AEc",
        name: "BUIDL",
        symbol: "BUIDL",
        icon: "https://s3.us-east-2.amazonaws.com/securitize-public-files/perm/8ca7c16b-de67-43f3-8d04-037bf2bd9c8d/0a6c7446-567e-4456-b722-f52f5cea942c-token-icon"
      },
      {
        bridgeContractAddress: "0x9A0460445E9B3E859F3C91A1b3f318354a0b11B6",
        address: "0x17418038ecF73BA4026c4f428547BF099706F27B",
        name: "Apollo Diversified Credit Securitize Fund",
        symbol: "ACRED",
        icon: "https://etherscan.io/token/images/apolloacred_64.png"
      },
    ]
  },
  ethereumSepolia: {
    mainnet: false,
    name: "Ethereum Sepolia",
    nativeCurrencySymbol: "ETH",
    chainId: 11155111,
    rpcUrl: "https://sepolia.infura.io/v3/" + INFURA_PROJECT_ID,
    icon: ethereumIcon, // Same variable for Sepolia testnet
  },

  // Polygon Mainnet and Amoy Testnet
  polygon: {
    mainnet: true,
    name: "Polygon",
    nativeCurrencySymbol: "POL",
    chainId: 137,
    rpcUrl: "https://polygon-mainnet.infura.io/v3/" + INFURA_PROJECT_ID,
    icon: polygonIcon, // Variable representing the Polygon icon
    // BUIDL
    // vaultAddress: "0x4C1e5e780269186A4FBb31c913b11B1a8922B830",
    // vaultAssetAddress: "0x2893Ef551B6dD69F661Ac00F11D93E5Dc5Dc0e99",
    // SCOPE
    vaultAddress: "0xA482Bec6614f3b923cC0079D5C27EE70B5791c5C",
    vaultAssetAddress: "0x4C5cA366e26409845624E29B62C388a06961A792",

    wormholeChainId: 5,
    // bridgeContractAddress: "0xcbB5B950A76B82Ec7982bABa99F5D4a92bA2288E",
    assets: [
      {
        bridgeContractAddress: "0xcbB5B950A76B82Ec7982bABa99F5D4a92bA2288E",
        address: "0x2893Ef551B6dD69F661Ac00F11D93E5Dc5Dc0e99",
        name: "BUIDL",
        symbol: "BUIDL",
        icon: "https://s3.us-east-2.amazonaws.com/securitize-public-files/perm/8ca7c16b-de67-43f3-8d04-037bf2bd9c8d/0a6c7446-567e-4456-b722-f52f5cea942c-token-icon"
      },
      {
        bridgeContractAddress: "0x9A0460445E9B3E859F3C91A1b3f318354a0b11B6",
        address: "0xFCe60bBc52a5705CeC5B445501FBAf3274Dc43D0",
        name: "Apollo Diversified Credit Securitize Fund",
        symbol: "ACRED",
        icon: "https://etherscan.io/token/images/apolloacred_64.png"
      },
    ]
  },
  polygonAmoy: {
    mainnet: false,
    name: "Polygon Amoy",
    nativeCurrencySymbol: "POL",
    chainId: 80002,
    rpcUrl: "https://rpc-amoy.polygon.technology",
    icon: polygonIcon,
    wormholeChainId: 10007,
    // bridgeContractAddress: "0xA4280e41fAa1DDbE00275781C8baAc2aFa103bDc",
    // assets: [
    //   {
    //     bridgeContractAddress: "0xA4280e41fAa1DDbE00275781C8baAc2aFa103bDc",
    //     address: "0xf4bCF42f7BB98EA33210cC72c6EFB5D6Fa9A631F",
    //     name: "NOV5",
    //     symbol: "NOV5",
    //     icon: "https://s3.us-east-2.amazonaws.com/sandbox-public-files/perm/8202afe0-3a3c-4bd4-a8fc-53396b1e176d/7e5f9fe0-c188-46f1-ab3d-97f7c2f9cf42-token-icon"
    //   }
    // ]
  },

  // Arbitrum Mainnet and Goerli Testnet
  arbitrum: {
    mainnet: true,
    name: "Arbitrum",
    nativeCurrencySymbol: "ETH",
    chainId: 42161,
    rpcUrl: "https://arbitrum-mainnet.infura.io/v3/" + INFURA_PROJECT_ID,
    icon: arbitrumIcon, // Variable representing the Arbitrum icon
    wormholeChainId: 23,
    assets: [
      {
        bridgeContractAddress: "0xcbB5B950A76B82Ec7982bABa99F5D4a92bA2288E",
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
    nativeCurrencySymbol: "ETH",
    chainId: 421614,
    rpcUrl: "https://arbitrum-sepolia.infura.io/v3/" + INFURA_PROJECT_ID,
    icon: arbitrumIcon, // Same variable for Sepolia testnet
    wormholeChainId: 10003,
    // bridgeContractAddress: "0x9e2Cc840CF4d163b1A9AfdBBeD11D04ACa91BC30",
    assets: [
      {
        bridgeContractAddress: "0x9e2Cc840CF4d163b1A9AfdBBeD11D04ACa91BC30",
        address: "0x1A925055FA634A991f48e7827AD8B14c92D4581A",
        name: "NOV5",
        symbol: "NOV5",
        icon: "https://s3.us-east-2.amazonaws.com/sandbox-public-files/perm/8202afe0-3a3c-4bd4-a8fc-53396b1e176d/7e5f9fe0-c188-46f1-ab3d-97f7c2f9cf42-token-icon"
      },
      {
        bridgeContractAddress:"0x9A0460445E9B3E859F3C91A1b3f318354a0b11B6",
        address: "0x36174e2676051dbC2c5A5125b67b46193bd56C6c",
        name: "FEB6",
        symbol: "FEB6",
        icon: "https://s3.us-east-2.amazonaws.com/sandbox-public-files/perm/8202afe0-3a3c-4bd4-a8fc-53396b1e176d/8c897c59-58ee-4f41-8ca0-c2e080704539-token-icon"
      },
      {
        // bridgeContractAddress:"0x4580B27ABc8915F4dFaea70F9A8163a7b91e3FD4",
        address: "0x4888Ae13fa5589E30e25b4ac8A34Aefdc06b3901",
        name: "AUG9",
        symbol: "AUG9",
        icon: "https://s3.us-east-2.amazonaws.com/sandbox-public-files/perm/8202afe0-3a3c-4bd4-a8fc-53396b1e176d/8c897c59-58ee-4f41-8ca0-c2e080704539-token-icon"
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
    nativeCurrencySymbol: "AVAX",
    chainId: 43114,
    rpcUrl: "https://avalanche-mainnet.infura.io/v3/" + INFURA_PROJECT_ID,
    icon: avalancheIcon, // Variable representing the Avalanche icon
    // BUIDL
    // vaultAddress: "0xaEb1FA0853c7C98EAb10fcF0EA669aE3d07FBB10",
    // vaultAssetAddress: "0x53FC82f14F009009b440a706e31c9021E1196A2F",
    wormholeChainId: 6,
    // bridgeContractAddress: "0xcbB5B950A76B82Ec7982bABa99F5D4a92bA2288E",
    assets: [
      {
        bridgeContractAddress: "0x9A0460445E9B3E859F3C91A1b3f318354a0b11B6",
        address: "0x7C64925002BFA705834B118a923E9911BeE32875",
        name: "Apollo Diversified Credit Securitize Fund",
        symbol: "ACRED",
        icon: "https://etherscan.io/token/images/apolloacred_64.png"
      },
      {
        bridgeContractAddress: "0xcbB5B950A76B82Ec7982bABa99F5D4a92bA2288E",
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
    nativeCurrencySymbol: "AVAX",
    chainId: 43113,
    rpcUrl: "https://avalanche-fuji.infura.io/v3/" + INFURA_PROJECT_ID,
    icon: avalancheIcon, // Same variable for Fuji testnet
    vaultAddress:"0xd7aa8784Ca4E234332cEe8f036434DE82651B992",
    vaultAssetAddress: "0x3454B9699fe19cf9219A3fe9D1F9956676eBA7Db",
    wormholeChainId: 6,
    // bridgeContractAddress: "0xA11e9c666ED79456951807334B290e0ee422D215",
    // bridgeContractAddress: "0x9281F9c872803cb6C5A3576dFba7210F23Ce24E4",
    // bridgeContractAddress: "0xA4280e41fAa1DDbE00275781C8baAc2aFa103bDc",
    assets: [
      {
        bridgeContractAddress: "0xA4280e41fAa1DDbE00275781C8baAc2aFa103bDc",
        address: "0x3454B9699fe19cf9219A3fe9D1F9956676eBA7Db",
        name: "NOV5",
        symbol: "NOV5",
        icon: "https://s3.us-east-2.amazonaws.com/sandbox-public-files/perm/8202afe0-3a3c-4bd4-a8fc-53396b1e176d/e3be35d8-40c8-43a3-aa00-3f6e23285941-token-icon"
      },
      {
        bridgeContractAddress:"0x9A0460445E9B3E859F3C91A1b3f318354a0b11B6",
        address: "0x28277DF5BDb175CeCEc7F21feaaCF2C836d81D50",
        name: "FEB6",
        symbol: "FEB6",
        icon: "https://s3.us-east-2.amazonaws.com/sandbox-public-files/perm/8202afe0-3a3c-4bd4-a8fc-53396b1e176d/8c897c59-58ee-4f41-8ca0-c2e080704539-token-icon"
      },
      {
        // bridgeContractAddress:"0x4580B27ABc8915F4dFaea70F9A8163a7b91e3FD4",
        address: "0xa0e3E3A377522Cb33CdCF9a20918A996C3457e23",
        name: "AUG9",
        symbol: "AUG9",
        icon: "https://s3.us-east-2.amazonaws.com/sandbox-public-files/perm/8202afe0-3a3c-4bd4-a8fc-53396b1e176d/8c897c59-58ee-4f41-8ca0-c2e080704539-token-icon"
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
    nativeCurrencySymbol: "ETH",
    chainId: 10,
    rpcUrl: "https://optimism-mainnet.infura.io/v3/" + INFURA_PROJECT_ID,
    icon: optimismIcon, // Variable representing the Optimism icon
    wormholeChainId: 24,
    // bridgeContractAddress: "0xcbB5B950A76B82Ec7982bABa99F5D4a92bA2288E",
    assets: [
      {
        bridgeContractAddress: "0xcbB5B950A76B82Ec7982bABa99F5D4a92bA2288E",
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
    nativeCurrencySymbol: "ETH",
    chainId: 11155420,
    rpcUrl: "https://optimism-sepolia.infura.io/v3/" + INFURA_PROJECT_ID,
    icon: optimismIcon, // Variable representing the Optimism icon
    wormholeChainId: 10005,

    // bridgeContractAddress: "0x8087c10b0B62C08533AdF59a58468f35ad94dD05 ",
    // bridgeContractAddress: "0xA84793e88F4816cb82093b74532c3DA7791e276c",
    assets: [
      {
        bridgeContractAddress: "0xA84793e88F4816cb82093b74532c3DA7791e276c",
        address: "0xa42A16AAe02Fd5bD0CeAb2a84485B74289eCc877",
        name: "NOV5",
        symbol: "NOV5",
        icon: "https://s3.us-east-2.amazonaws.com/sandbox-public-files/perm/8202afe0-3a3c-4bd4-a8fc-53396b1e176d/e3be35d8-40c8-43a3-aa00-3f6e23285941-token-icon"
      },
      {
        bridgeContractAddress:"0x9A0460445E9B3E859F3C91A1b3f318354a0b11B6",
        address: "0x56c3e2d4c13C686772060b81B88e94ad8ee8157b",
        name: "FEB6",
        symbol: "FEB6",
        icon: "https://s3.us-east-2.amazonaws.com/sandbox-public-files/perm/8202afe0-3a3c-4bd4-a8fc-53396b1e176d/8c897c59-58ee-4f41-8ca0-c2e080704539-token-icon"
      },
      {
        // bridgeContractAddress:"0x4580B27ABc8915F4dFaea70F9A8163a7b91e3FD4",
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

  // InkChain Mainnet and Sepolia Testnet
  inkChain: {
    mainnet: true,
    name: "Ink Chain",
    nativeCurrencySymbol: "ETH",
    chainId: 57073,
    rpcUrl: "https://ink.drpc.org",
    icon: inkChainIcon, // Variable representing the icon
    wormholeChainId: 46,
    assets: [
      {
        bridgeContractAddress: "0x9A0460445E9B3E859F3C91A1b3f318354a0b11B6",
        address: "0x53Ad50D3B6FCaCB8965d3A49cB722917C7DAE1F3",
        name: "Apollo Diversified Credit Securitize Fund",
        symbol: "ACRED",
        icon: "https://etherscan.io/token/images/apolloacred_64.png"
      },
    ]
  },

  inkChainSepolia: {
    mainnet: false,
    name: "Ink Sepolia",
    nativeCurrencySymbol: "ETH",
    chainId: 763373,
    rpcUrl: "https://newest-wiser-replica.ink-sepolia.quiknode.pro/0d55a359ccc307be2b1fc478adca9b2f8b00c802",

    // rpcUrl: "https://rpc-gel-sepolia.inkonchain.com",
    // rpcUrl: "https://ink-sepolia.g.alchemy.com/v2/MPp5oGWLR7Ri5O0LtgQoihUI8uEyIHPV",
    icon: inkChainIcon, // Variable representing the icon
    wormholeChainId: 46,

    assets: [
      {
        bridgeContractAddress:"0xBe5Ff9533B30917472Ac96F18A594Aa140d5C656",
        address: "0x9d219e45E8A6e1273D017a9c5f016092f8081011",
        name: "FEB6",
        symbol: "FEB6",
        icon: "https://s3.us-east-2.amazonaws.com/sandbox-public-files/perm/8202afe0-3a3c-4bd4-a8fc-53396b1e176d/8c897c59-58ee-4f41-8ca0-c2e080704539-token-icon"
      },

    ]
  },

  // Base Mainnet and Goerli Testnet
  base: {
    mainnet: true,
    name: "Base",
    nativeCurrencySymbol: "BASE",
    chainId: 8453,
    rpcUrl: "https://mainnet.base.org",
    icon: baseIcon, // Variable representing the Base icon
  },

  baseGoerli: {
    mainnet: false,
    name: "Base Goerli Testnet",
    nativeCurrencySymbol: "BASE",
    chainId: 84531,
    rpcUrl: "https://goerli.base.org",
    icon: baseIcon, // Same variable for Goerli testnet
  },

  // XDC Mainnet and Apothem Testnet
  xdc: {
    mainnet: true,
    name: "XDC Network",
    nativeCurrencySymbol: "XDC",
    chainId: 50,
    rpcUrl: "https://rpc.xinfin.network",
    icon: xdcIcon, // Variable representing the XDC icon
  },
  xdcApothem: {
    mainnet: false,
    name: "XDC Apothem Testnet",
    nativeCurrencySymbol: "XDC",
    chainId: 51,
    rpcUrl: "https://rpc.apothem.network",
    icon: xdcIcon, // Same variable for Apothem testnet
  },

  // Celo Mainnet and Alfajores Testnet
  celo: {
    mainnet: true,
    name: "Celo",
    nativeCurrencySymbol: "CELO",
    chainId: 42220,
    rpcUrl: "https://forno.celo.org",
    icon: celoIcon, // Variable representing the Celo icon
  },
  celoAlfajores: {
    mainnet: false,
    name: "Celo Alfajores",
    nativeCurrencySymbol: "CELO",
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
//// Vault Config
////
//////////////////////////////////////////
//////////////////////////////////////////

// // For Vault in Mainnet
// export const VaultAddress = "0x07a36C630e3F072637da3445Da733B29958D8cAB"; 
// export const AssetAddress = "0x7712c34205737192402172409a8F7ccef8aA2AEc";
// export const AssetName = "BUIDL";
// export const RepresentationTokenName = "sBUIDL";
// export const TargetBlockchainChainId = 1;


// // For Vault in Testnets
// export const VaultAddress = "0x602B85F6e27656d2897fF6984896d9af7661939f";
// export const AssetAddress = "0x71dB752c6642bb1CeD83c48C43C7A9E003F36AA1";
// export const AssetName = "TA AVA";
// export const RepresentationTokenName = "szTAAVA";
// export const TargetBlockchainChainId = 43113;

// // For Vault in Testnets
// export const VaultAddress = "0xd7aa8784Ca4E234332cEe8f036434DE82651B992";
// export const AssetAddress = "0x3454B9699fe19cf9219A3fe9D1F9956676eBA7Db";
// export const AssetName = "NOV5";
// export const RepresentationTokenName = "sNOV5";
// export const TargetBlockchainChainId = 43113;

// // For Vault in Avalanche Production
// export const VaultAddress = "0xaEb1FA0853c7C98EAb10fcF0EA669aE3d07FBB10";
// export const AssetAddress = "0x53FC82f14F009009b440a706e31c9021E1196A2F";
// export const AssetName = "BUIDL";
// export const RepresentationTokenName = "sBUIDL";
// export const TargetBlockchainChainId = 43114;

// For Vault in Poloygon Production (sBUIDL)
export const VaultAddress = "0xA482Bec6614f3b923cC0079D5C27EE70B5791c5C";
export const AssetAddress = "0x4C5cA366e26409845624E29B62C388a06961A792";
export const AssetName = "HLSCOPE";
export const RepresentationTokenName = "sHLSCOPE";
export const TargetBlockchainChainId = 137;