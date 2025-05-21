export const getVaultAuthority = () => {
  const [vaultAuthority] = PublicKey.findProgramAddress(
    [Buffer.from("vault_authority"), vaultStatePk.toBuffer()],
    program.programId
  );

  return vaultAuthority;
};
