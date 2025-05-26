import { BaseWalletMultiButton } from "@solana/wallet-adapter-react-ui";
import "@solana/wallet-adapter-react-ui/styles.css";

const LABELS = {
  "change-wallet": "Change wallet",
  connecting: "Connecting ...",
  "copy-address": "Copy address",
  copied: "Copied",
  disconnect: "Disconnect",
  "has-wallet": "Connect",
  "no-wallet": "Connect Solana Wallet"
};

export default function SolanaWalletConnect() {
  return (
    <BaseWalletMultiButton
      labels={LABELS}
      style={{
        background: "#3b3d5b",
        fontWeight: "normal",
        textTransform: "uppercase",
        fontSize: "14px"
      }}
    />
  );
}
