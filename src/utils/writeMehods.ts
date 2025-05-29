import { useState } from "react";

import {
  getVaultStateById,
  getVaultStatePda,
  useProgram
} from "./anchorHelpers";

export const useOnPause = (vaultId) => {
  const [value, setValue] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const program = useProgram();

  const OnPause = async () => {
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
    execute: OnPause,
    loading,
    value
  };
};

export const useUnPause = (vaultId) => {
  const [value, setValue] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const program = useProgram();

  const OnPause = async () => {
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
    execute: OnPause,
    loading,
    value
  };
};
