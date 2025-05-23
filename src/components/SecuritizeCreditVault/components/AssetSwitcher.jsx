import React, { useEffect } from "react";

import {
  Box,
  CardMedia,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Typography
} from "@mui/material";
import { useSwitchNetwork } from "@web3modal/ethers/react";

import { useAppContext } from "../../../utils/AppContext";
import { blockchainInfo } from "../../../utils/globals";

function AssetSwitcher() {
  const ctx = useAppContext();
  const { switchNetwork } = useSwitchNetwork();

  const {
    selectedAssetKey,
    setSelectedAssetKey,
    setVaultAddress,
    setVaultAssetAddress,
    setTargetBlockchainChainId,
    showMainNets,
    selectedAsset,
    setSelectedAsset
  } = ctx;

  const availableAssets = [];

  Object.entries(blockchainInfo).forEach(([chainKey, chain]) => {
    if (chain.mainnet === showMainNets && chain.assets) {
      chain.assets.forEach((asset, idx) => {
        if (asset.vaultAddress) {
          // ONLY CHECK vaultAddress
          availableAssets.push({
            key: `${chainKey}-${idx}`,
            chainName: chain.name,
            chainIcon: chain.icon,
            chainId: chain.chainId,
            vaultAddress: asset.vaultAddress, // important
            address: asset.address, // important
            representationTokenName: asset.RepresentationTokenName,
            assetName: asset.name,
            assetSymbol: asset.symbol,
            assetIcon: asset.icon
          });
        }
      });
    }
  });

  useEffect(() => {
    if (availableAssets.length > 0 && !selectedAssetKey) {
      const defaultAsset = availableAssets[0];
      setSelectedAssetKey(defaultAsset.key);
      setSelectedAsset(defaultAsset);
      setVaultAddress(defaultAsset.vaultAddress);
      setVaultAssetAddress(defaultAsset.address);
      setTargetBlockchainChainId(defaultAsset.chainId);
    }
  }, [
    availableAssets,
    selectedAssetKey,
    setSelectedAssetKey,
    setVaultAddress,
    setVaultAssetAddress,
    setTargetBlockchainChainId,
    selectedAsset,
    setSelectedAsset,
    showMainNets
  ]);

  const handleChange = async (event) => {
    const selected = availableAssets.find((a) => a.key === event.target.value);
    setSelectedAssetKey(selected.key);
    setVaultAddress(selected.vaultAddress);
    setVaultAssetAddress(selected.address);
    setTargetBlockchainChainId(selected.chainId);
    setSelectedAsset(selected);

    try {
      const chain = Object.values(blockchainInfo).find(
        (c) => c.chainId === selected.chainId
      );
      if (!chain)
        throw new Error(
          `Chain with ID ${selected.chainId} not found in blockchainInfo`
        );

      await switchNetwork(chain.chainId);
      console.group("Switched Network");
      console.log(`Switched to chain: ${chain.name} (ID: ${chain.chainId})`);
      console.log(`Vault Address: ${selected.vaultAddress}`);
      console.log(`Vault Asset: ${selected.address}`);
      console.log(`Target Blockchain Chain ID: ${chain.chainId}`);
      console.groupEnd();
    } catch (error) {
      console.error("Error switching network:", error);
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        mt: 3
      }}
    >
      <Typography variant="h6" gutterBottom>
        Select Asset
      </Typography>
      <FormControl fullWidth variant="outlined" sx={{ maxWidth: 400 }}>
        <InputLabel id="asset-selector-label">Asset</InputLabel>
        <Select
          labelId="asset-selector-label"
          value={selectedAssetKey}
          onChange={handleChange}
          label="Asset"
        >
          {availableAssets.map((asset) => (
            <MenuItem key={asset.key} value={asset.key}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <CardMedia
                  component="img"
                  src={asset.assetIcon}
                  alt={asset.assetName}
                  sx={{ width: 24, height: 24, borderRadius: "50%" }}
                />
                <Typography>{`${asset.assetSymbol} (${asset.chainName})`}</Typography>
              </Box>
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  );
}

export default AssetSwitcher;
