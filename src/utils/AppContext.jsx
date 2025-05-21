import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  version
} from "react";

const AppContext = createContext();
export default AppContext;

const SolanaWalletProvider = ({ children }) => {
  const network = WalletAdapterNetwork.Mainnet;
  const endpoint = "https://api.mainnet-beta.solana.com";

  const wallets = useMemo(() => [new PhantomWalletAdapter()], []);

  const LABELS = {
    "change-wallet": "Change wallet",
    connecting: "Connecting ...",
    "copy-address": "Copy address",
    copied: "Copied",
    disconnect: "Disconnect",
    "has-wallet": "Connect",
    "no-wallet": "Connect Solana Wallet"
  };
  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
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
      {children}
    </AppContext.Provider>
  );
};

// custom hook
export const useAppContext = () => useContext(AppContext);
