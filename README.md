# README

## Adding New Assets (Tokens) in Solana

To add new assets (tokens) in Solana, follow these steps:

1. **Open** the `globals.js` file.
2. **Find** the `blockchainInfo` object and locate the `solana` section.
3. **Locate** the `assets` array inside the `solana` object. Each item is an object describing a token.
4. **Add** a new object to the `assets` array with the following **required** fields:

   - **vaultAddress**: the vault address on Solana (required).
   - **vaultId**: the vault identifier (required).
   - **name**: the token name.
   - **symbol**: the token symbol.
   - **icon**: the path to the token icon (local file or URL).

### Example

```js
assets: [
  {
    vaultAddress: "9N3yqarWXmXJ9NQBGgN47JXV82smby8nSMffkwetgYov",
    vaultId: "0",
    name: "Solana",
    symbol: "SPL",
    icon: "/solana-sol-logo.png"
  },
  {
    vaultAddress: "YOUR_NEW_VAULT_ADDRESS",
    vaultId: "YOUR_VAULT_ID",
    name: "Token Name",
    symbol: "SYMBOL",
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
