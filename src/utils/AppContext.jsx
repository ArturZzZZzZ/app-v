import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  version
} from "react";

import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import {
  ConnectionProvider,
  WalletProvider
} from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { PhantomWalletAdapter } from "@solana/wallet-adapter-wallets";
import { clusterApiUrl } from "@solana/web3.js";

import { TEST_VERSION } from "./globals";

const AppContext = createContext();
export default AppContext;

export function getCluster(cluster) {
  switch (cluster) {
    case WalletAdapterNetwork.Mainnet:
      return {
        name: "Mainnet Beta",
        endpoint: "",
        network: WalletAdapterNetwork.Mainnet
      };
    case WalletAdapterNetwork.Devnet:
      return {
        name: "Devnet",
        endpoint: clusterApiUrl("devnet"),
        network: WalletAdapterNetwork.Devnet
      };
    default:
      return {
        name: "Mainnet Beta",
        endpoint: clusterApiUrl("mainnet-beta"),
        network: WalletAdapterNetwork.Mainnet
      };
  }
}

const network = TEST_VERSION
  ? WalletAdapterNetwork.Devnet
  : WalletAdapterNetwork.Mainnet;

const cluster = getCluster(network);
const endpoint = cluster.endpoint;
const wallets = [new PhantomWalletAdapter()];

const SolanaWalletProvider = ({ children }) => {
  const onError = useCallback((error) => {
    console.error(error);
  }, []);

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} onError={onError} autoConnect>
        <WalletModalProvider>{children}</WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
};

// basic context provider
export const AppProvider = ({ children }) => {
  // define state
  const [showMainNets, setShowMainNets] = useState(true);
  const [vaultAddress, setVaultAddress] = useState("");
  const [vaultAssetAddress, setVaultAssetAddress] = useState("");
  const [TargetBlockchainChainId, setTargetBlockchainChainId] = useState(0);
  const [selectedAssetKey, setSelectedAssetKey] = useState("");
  const [selectedAsset, setSelectedAsset] = useState(null);
  return (
    <AppContext.Provider
      value={{
        showMainNets,
        setShowMainNets,
        vaultAddress,
        setVaultAddress,
        vaultAssetAddress,
        setVaultAssetAddress,
        TargetBlockchainChainId,
        setTargetBlockchainChainId,
        selectedAssetKey,
        setSelectedAssetKey,
        selectedAsset,
        setSelectedAsset
      }}
    >
      <SolanaWalletProvider>{children}</SolanaWalletProvider>
    </AppContext.Provider>
  );
};

// custom hook
export const useAppContext = () => useContext(AppContext);
