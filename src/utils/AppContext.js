import React, { createContext, useContext, useState, useEffect, version } from 'react';

const AppContext = createContext();
export default AppContext;

// basic context provider
export const AppProvider = ({ children }) => {
    // define state
    const [showMainNets, setShowMainNets] = useState(true);
    const [vaultAddress, setVaultAddress] = useState('');
    const [vaultAssetAddress, setVaultAssetAddress] = useState('');
    const [TargetBlockchainChainId, setTargetBlockchainChainId] = useState(0);
    const [selectedAssetKey, setSelectedAssetKey] = useState('');
    return (
        <AppContext.Provider value={{ showMainNets, setShowMainNets,
                                        vaultAddress, setVaultAddress,
                                        vaultAssetAddress, setVaultAssetAddress,
                                        TargetBlockchainChainId, setTargetBlockchainChainId,
                                        selectedAssetKey, setSelectedAssetKey
         }}>
            {children}
        </AppContext.Provider>
    );
};

// custom hook
export const useAppContext = () => useContext(AppContext);
