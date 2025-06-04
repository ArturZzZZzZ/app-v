# README

## Vault Program Interaction Guide

To interact with the Vault program, you must use the up-to-date IDL files located at:
src/api/solana/idls

### IDL Files:

- **Mainnet**:  
  `sc_vault.json`

- **Devnet**:  
  `sc_vault_devnet.json`

> ⚠️ **Important:**  
> Update these files after each release of a new version of the Vault smart contract.

## Adding New Assets (Tokens) in Solana

To add new assets (tokens) in Solana, follow these steps:

1. **Open** the `globals.js` file.
2. **Find** the `blockchainInfo` object and locate the `solana` or `solanaDevnet` section.
3. **Locate** the `assets` array inside the `solana` or `solanaDevnet` object. Each item is an object describing a token.
4. **Add** a new object to the `assets` array with the following **required** fields:

   - **vaultAddress**: the vault address on Solana (required).
   - **address**: the asset Vault on Solana (required).
   - **vaultId**: the vault identifier (required).
   - **name**: the token name.
   - **symbol**: the token symbol.
   - **RepresentationTokenName**: the vault token symbol.
   - **icon**: the path to the token icon (local file or URL).

### Example

```js
assets: [
  {
    vaultAddress: "9L4WxKkUHKBZ96EpHBc7APqvEhobmY1A2ENk5dUfdrpw",
    address: "HH7HCHymx28RKrfUh8QgJBpEe92LQwSuvFENUVkcwQeg",
    vaultId: "0",
    name: "Solana",
    symbol: "SPL vault0",
    RepresentationTokenName: "sSPL vault0",
    icon: "/solana-sol-logo.png"
  },
  {
    vaultAddress: "YOUR_NEW_VAULT_ADDRESS",
    address: "YOUR_ASSETS_VAULT_ADDRESS",
    vaultId: "YOUR_VAULT_ID",
    name: "Token Name",
    symbol: "SYMBOL",
    RepresentationTokenName: "VAULT TOKEN SYMBOL",
    icon: "path/to/icon.png"
  }
];
```

Save the file. The new asset will appear in the interface when selecting the Solana network.

---

## Building and Running in Production

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Build for production**

   ```bash
   npm run build
   ```

3. **Preview the production build locally**

   ```bash
   npm run preview
   ```

**Alternative Deployment:**

Deploy the `dist` directory to a static file host or serve it using a static server:

```bash
npx serve dist
```
