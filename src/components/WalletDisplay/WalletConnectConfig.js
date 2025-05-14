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

const INFURA_PROJECT_ID = 'ac240982f9804e358d1f59fc60a5c451';
export const walletConnectProjectId = '9d05d4b1b35fad1c007771dc63f9911d';
export const TargetBlockchainChainId = 43113;

export const walletConnectMetadata = {
    name: 'Securitize Bridge',
    description: 'Securitize Bridge for BUIDL',
    url: 'https://web3.hoolynk.com', // origin must match your domain & subdomain
    icons: ['https://s3.us-east-2.amazonaws.com/securitize-public-files/perm/8ca7c16b-de67-43f3-8d04-037bf2bd9c8d/0a6c7446-567e-4456-b722-f52f5cea942c-token-icon']
};

export const walletConnectTargetBlockchainConfig = [
    {
        chainId: 1,
        name: 'Ethereum Mainnet',
        currency: 'ETH',
        explorerUrl: 'https://etherscan.io/',
        rpcUrl: `https://mainnet.infura.io/v3/${INFURA_PROJECT_ID}`
    },
    {
        chainId: 11155111,
        name: 'Ethereum Sepolia',
        currency: 'ETH',
        explorerUrl: 'https://sepolia.etherscan.io/',
        rpcUrl: `https://sepolia.infura.io/v3/${INFURA_PROJECT_ID}`
    },
    {
        chainId: 137,
        name: 'Polygon Mainnet',
        currency: 'MATIC',
        explorerUrl: 'https://polygonscan.com/',
        rpcUrl: `https://polygon-mainnet.infura.io/v3/${INFURA_PROJECT_ID}`
    },
    {
        chainId: 43114,
        name: 'Avalanche Mainnet',
        currency: 'AVAX',
        explorerUrl: 'https://snowtrace.io/',
        rpcUrl: `https://avalanche-mainnet.infura.io/v3/${INFURA_PROJECT_ID}`
    },
    {
        chainId: 42161,
        name: 'Arbitrum One',
        currency: 'ETH',
        explorerUrl: 'https://arbiscan.io/',
        rpcUrl: `https://arbitrum-mainnet.infura.io/v3/${INFURA_PROJECT_ID}`
    },
    {
        chainId: 10,
        name: 'Optimism Mainnet',
        currency: 'ETH',
        explorerUrl: 'https://optimistic.etherscan.io/',
        rpcUrl: `https://optimism-mainnet.infura.io/v3/${INFURA_PROJECT_ID}`
    },
    {
        chainId: 43113,
        name: 'Avalanche Fuji Testnet',
        currency: 'AVAX',
        explorerUrl: 'https://testnet.snowtrace.io',
        rpcUrl: `https://avalanche-fuji.infura.io/v3/${INFURA_PROJECT_ID}`
    },
    {
        chainId: 44787,
        name: 'Celo Alfajores',
        currency: 'CELO',
        explorerUrl: 'https://alfajores.celoscan.io/',
        rpcUrl: 'https://alfajores-forno.celo-testnet.org'  // Not using Infura
    },
    {
        chainId: 57073,
        name: 'Ink ',
        currency: 'ETH',
        explorerUrl: 'https://explorer.inkonchain.com/',
        rpcUrl: "https://ink.drpc.org",
    },
    {
        chainId: 763373,
        name: 'Ink Sepolia',
        currency: 'ETH',
        explorerUrl: 'https://explorer-sepolia.inkonchain.com/',
        rpcUrl: "https://rpc-gel-sepolia.inkonchain.com",
    },
    {
        chainId: 421614,
        name: "Arbitrum Sepolia",
        currency: 'ETH',
        explorerUrl: 'https://sepolia.arbiscan.io/',
        rpcUrl: `https://arbitrum-sepolia.infura.io/v3/${INFURA_PROJECT_ID}`
    },
    {
        chainId: 11155420,
        name: 'Optimism Sepolia',
        currency: 'ETH',
        explorerUrl: 'https://sepolia-optimism.etherscan.io/',
        rpcUrl: `https://optimism-sepolia.infura.io/v3/${INFURA_PROJECT_ID}`
    },
    {
        chainId: 80002,
        name: 'Polygon Amoy',
        currency: 'MATIC',
        explorerUrl: 'https://amoy.polygonscan.com/',
        rpcUrl: 'https://rpc-amoy.polygon.technology'  // Not using Infura
    },
    {
        chainId: 56,
        name: 'BNB Chain',
        currency: 'BNB',
        explorerUrl: 'https://bscscan.com/',
        rpcUrl: "https://binance.llamarpc.com",
    }
];



