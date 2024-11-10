// TransactionProgressDialog.js
import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Typography, Link, Button } from '@mui/material';

const TransactionProgressDialog = ({ open, onClose, txHash }) => (
    <Dialog open={open} onClose={onClose}>
        <DialogTitle>Bridging in Progress</DialogTitle>
        <DialogContent>
            <Typography align="center">
                Your transaction is being processed. The bridging process may take some time as it requires confirmation on both the source and destination blockchains. You can monitor the transaction’s status by clicking on the link below to view real-time updates on Wormhole Scan.
            </Typography>
            <Typography align="center" variant="body2" sx={{ mt: 1, mb: 3 }}>
                <Link
                    href={`https://wormholescan.io/#/tx/${txHash}?network=Testnet&view=progress`}
                    target="_blank"
                    rel="noopener"
                >
                    View transaction status on Wormhole Scan
                </Link>
            </Typography>
            <Typography variant="body2">
                Bridging times may vary based on network congestion and blockchain speeds. Please be patient, and rest assured your transaction is underway.
            </Typography>
        </DialogContent>
        <DialogActions>
            <Button onClick={onClose} color="primary">
                Close
            </Button>
        </DialogActions>
    </Dialog>
);

export default TransactionProgressDialog;