import React, { useEffect, useState } from 'react';
import { BrowserProvider, Contract, formatUnits } from 'ethers'
import { useWeb3ModalProvider, useWeb3ModalAccount } from '@web3modal/ethers/react'


function TokenBalance({ contractAddress, abi, label, refresh }) {
    const { address, isConnected } = useWeb3ModalAccount();
    const [balance, setBalance] = useState(null);
    const { walletProvider } = useWeb3ModalProvider();

    async function getTokenBalance() {
        if (!isConnected || !walletProvider) {
            console.log('User disconnected');
            return;
        }

        try {
            const ethersProvider = await new BrowserProvider(walletProvider);
            const signer = await ethersProvider.getSigner();

            const contract = await new Contract(contractAddress, abi, signer);

            const tokenBalance = await contract.balanceOf(address);
            const formattedBalance = formatUnits(tokenBalance, 6);
            setBalance(formattedBalance);
        } catch (error) {
            console.log('Failed to fetch balance:', error);
        }
    }
    useEffect(() => {
        if (walletProvider)
            getTokenBalance();
    }, [address, isConnected, contractAddress, refresh]);

    useEffect(() => {
        if (walletProvider) {
            const handleAccountsChanged = () => getTokenBalance();
            const handleChainChanged = () => getTokenBalance();

            console.log("Changed wallet Provider: ", walletProvider);

            walletProvider.on('accountsChanged', handleAccountsChanged);
            walletProvider.on('chainChanged', handleChainChanged);

            return () => {
                if (walletProvider.removeListener) {
                    walletProvider.removeListener('accountsChanged', handleAccountsChanged);
                    walletProvider.removeListener('chainChanged', handleChainChanged);
                }
            };
        }
    }, [walletProvider, address]);

    return (
        <>
            {balance !== null ? (
                <>{label} Balance: {parseFloat(balance).toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</>
            ) : (
                <>{label} Balance: - </>
            )}
        </>
    );
}

export default TokenBalance;
