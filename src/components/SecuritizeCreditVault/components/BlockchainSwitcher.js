import React, { useState } from 'react';
import { useSwitchNetwork } from '@web3modal/ethers/react';
import { blockchainInfo } from '../../../utils/globals'; // Import blockchain info

function BlockchainSwitcher() {
    const [selectedChainId, setSelectedChainId] = useState('');
    const { switchNetwork } = useSwitchNetwork();

    const handleChange = async (event) => {
        const chainKey = event.target.value;
        const chain = blockchainInfo[chainKey];

        if (!chain) {
            console.error('Invalid chain selected');
            return;
        }

        try {
            await switchNetwork(chain.chainId);
            setSelectedChainId(chainKey);
            console.log(`Switched to chain: ${chain.name} (ID: ${chain.chainId})`);
        } catch (error) {
            console.error('Error switching network:', error);
        }
    };

    // Filter blockchains that have a vaultAddress
    const filteredBlockchains = Object.entries(blockchainInfo).filter(
        ([, chain]) => chain.vaultAddress
    );

    return (
        <div>
            <label htmlFor="blockchain-selector">Select Blockchain:</label>
            <select
                id="blockchain-selector"
                value={selectedChainId}
                onChange={handleChange}
            >
                <option value="">Select a Blockchain</option>
                {filteredBlockchains.map(([chainKey, chain]) => (
                    <option key={chainKey} value={chainKey}>
                        {chain.name}
                    </option>
                ))}
            </select>
        </div>
    );
}

export default BlockchainSwitcher;