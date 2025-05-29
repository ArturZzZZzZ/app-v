import { useState } from "react";

import { PublicKey } from "@solana/web3.js";

import {
  getVaultStateById,
  getVaultStatePda,
  useProgram
} from "./anchorHelpers";

export const useOnPause = (vaultId) => {
  const [value, setValue] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const program = useProgram();

  const execute = async () => {
    try {
      setLoading(true);
      const vaultState = await getVaultStateById(program, vaultId);
      const adminPk = vaultState.admin;
      const vaultStatePk = getVaultStatePda(program.programId, vaultId);

      const signature = await program.methods
        .pause()
        .accountsPartial({ vaultState: vaultStatePk, admin: adminPk })
        .rpc();

      setValue(signature);
      return signature;
    } catch (error) {
      console.error("Error changeAdmin:", error);
      throw new Error(
        `Failed to change admin: ${error instanceof Error ? error.message : String(error)}`
      );
    } finally {
      setLoading(false);
    }
  };

  return {
    execute,
    loading,
    value
  };
};

export const useUnPause = (vaultId) => {
  const [value, setValue] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const program = useProgram();

  const execute = async () => {
    try {
      setLoading(true);
      const vaultState = await getVaultStateById(program, vaultId);
      const adminPk = vaultState.admin;
      const vaultStatePk = getVaultStatePda(program.programId, vaultId);

      const signature = await program.methods
        .unpause()
        .accountsPartial({ vaultState: vaultStatePk, admin: adminPk })
        .rpc();

      setValue(signature);
      return signature;
    } catch (error) {
      console.error("Error changeAdmin:", error);
      throw new Error(
        `Failed to change admin: ${error instanceof Error ? error.message : String(error)}`
      );
    } finally {
      setLoading(false);
    }
  };

  return {
    execute,
    loading,
    value
  };
};

export const useSetLiquidationOpenToPublic = (vaultId) => {
  const [value, setValue] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const program = useProgram();

  const execute = async (bool) => {
    try {
      setLoading(true);
      const vaultState = await getVaultStateById(program, vaultId);
      const adminPk = vaultState.admin;
      const vaultStatePk = getVaultStatePda(program.programId, vaultId);

      const signature = await program.methods
        .setLiquidationOpenToPublic(Boolean(bool))
        .accountsPartial({ vaultState: vaultStatePk, admin: adminPk })
        .rpc();

      setValue(signature);
      return signature;
    } catch (error) {
      console.error("Error changeAdmin:", error);
      throw new Error(
        `Failed to change admin: ${error instanceof Error ? error.message : String(error)}`
      );
    } finally {
      setLoading(false);
    }
  };

  return {
    execute,
    loading,
    value
  };
};

export const useUpdateNavProvider = (vaultId) => {
  const [value, setValue] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const program = useProgram();

  const execute = async (navProvider) => {
    try {
      setLoading(true);
      const vaultState = await getVaultStateById(program, vaultId);
      const adminPk = vaultState.admin;
      const vaultStatePk = getVaultStatePda(program.programId, vaultId);
      const navProviderPk = new PublicKey(navProvider);

      const signature = await program.methods
        .updateNavProvider()
        .accountsPartial({
          newNavProviderProgram: navProviderPk,
          vaultState: vaultStatePk,
          admin: adminPk
        })
        .rpc();

      setValue(signature);
      return signature;
    } catch (error) {
      console.error("Error changeAdmin:", error);
      throw new Error(
        `Failed to change admin: ${error instanceof Error ? error.message : String(error)}`
      );
    } finally {
      setLoading(false);
    }
  };

  return {
    execute,
    loading,
    value
  };
};

export const useRevokeLiquidator = (vaultId) => {
  const [value, setValue] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const program = useProgram();

  const execute = async (liquidator) => {
    try {
      setLoading(true);
      const vaultState = await getVaultStateById(program, vaultId);
      const adminPk = vaultState.admin;
      const vaultStatePk = getVaultStatePda(program.programId, vaultId);
      const liquidatorPk = new PublicKey(liquidator);

      const signature = await program.methods
        .revokeLiquidator(liquidatorPk)
        .accountsPartial({
          vaultState: vaultStatePk,
          admin: adminPk
        })
        .rpc();

      setValue(signature);
      return signature;
    } catch (error) {
      console.error("Error changeAdmin:", error);
      throw new Error(
        `Failed to change admin: ${error instanceof Error ? error.message : String(error)}`
      );
    } finally {
      setLoading(false);
    }
  };

  return {
    execute,
    loading,
    value
  };
};

export const useRevokeRedeemer = (vaultId) => {
  const [value, setValue] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const program = useProgram();

  const execute = async (redeemer) => {
    try {
      setLoading(true);
      const vaultState = await getVaultStateById(program, vaultId);
      const adminPk = vaultState.admin;
      const vaultStatePk = getVaultStatePda(program.programId, vaultId);
      const redeemerPk = new PublicKey(redeemer);

      const signature = await program.methods
        .revokeOperator(redeemerPk)
        .accountsPartial({
          vaultState: vaultStatePk,
          admin: adminPk
        })
        .rpc();

      setValue(signature);
      return signature;
    } catch (error) {
      console.error("Error changeAdmin:", error);
      throw new Error(
        `Failed to change admin: ${error instanceof Error ? error.message : String(error)}`
      );
    } finally {
      setLoading(false);
    }
  };

  return {
    execute,
    loading,
    value
  };
};
