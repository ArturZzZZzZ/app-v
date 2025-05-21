import idl from "./idls/sc_vault.json";

export const getVaultProgram = ({ provider, vaultPk }) => {
  const programId = vaultPk || idl.address;
  const program = new Program(idl, programId, provider);
  return program;
};
