// InsufficientBalanceDialog.js
import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Typography, Button } from '@mui/material';
import { formatUnits, ethers } from 'ethers';

const InsufficientBalanceDialog = ({ open, onClose, nativeBalance, quote, currencySymbol }) => (
    <Dialog open={open} onClose={onClose}>
        <DialogTitle>Insufficient Balance</DialogTitle>
        <DialogContent>
            <Typography>
                The current balance in your wallet is {formatUnits(nativeBalance, 18)} {currencySymbol}.
                You do not have enough {currencySymbol} to cover the transaction fees. 
                The estimated minimum required amount is {ethers.formatEther(quote)} {currencySymbol}. 
                Please add more funds and try again.
            </Typography>
        </DialogContent>
        <DialogActions>
            <Button onClick={onClose} color="primary">OK</Button>
        </DialogActions>
    </Dialog>
);

export default InsufficientBalanceDialog;