import { defaultConfig, createWeb3Modal } from '@web3modal/ethers/react';
import { TargetBlockchainChainId, walletConnectMetadata, walletConnectProjectId, walletConnectTargetBlockchainConfig } from '../utils/globals';

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