import React, { useState } from 'react';
import VaultTransactionUI from './ui/VaultTransactionUI';

const VaultTransactionContainer = () => {
  const [assets, setAssets] = useState(0);
  const [action, setAction] = useState('deposit');
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('info');

  const maxAssets = 100;

  const getButtonText = () => {
    switch (step) {
      case 1:
        return 'Approving...';
      case 2:
        return 'Processing...';
      case 3:
        return 'Confirmed';
      default:
        return action.charAt(0).toUpperCase() + action.slice(1);
    }
  };

  const handleTransaction = async () => {
    setLoading(true);
    setSnackbarMessage('Transaction started...');
    setSnackbarSeverity('info');
    setSnackbarOpen(true);

    setTimeout(() => {
      setLoading(false);
      setStep(3);
      setSnackbarMessage('Transaction successful!');
      setSnackbarSeverity('success');
    }, 2000);
  };

  const handleSnackbarClose = () => setSnackbarOpen(false);

  return (
    <VaultTransactionUI
      assets={assets}
      setAssets={setAssets}
      action={action}
      setAction={setAction}
      step={step}
      loading={loading}
      handleTransaction={handleTransaction}
      getButtonText={getButtonText}
      snackbarOpen={snackbarOpen}
      snackbarMessage={snackbarMessage}
      snackbarSeverity={snackbarSeverity}
      handleSnackbarClose={handleSnackbarClose}
      maxAssets={maxAssets}
    />
  );
};

export default VaultTransactionContainer;