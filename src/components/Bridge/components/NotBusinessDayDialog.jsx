import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Typography, Button } from '@mui/material';

const NotBusinessDayDialog = ({ open, onClose }) => (
    <Dialog open={open} onClose={onClose}>
        <DialogTitle>Service Unavailable</DialogTitle>
        <DialogContent>
            <Typography paragraph>
                Thank you for choosing our bridging service. As this digital asset is directly linked to a real-world asset (BUIDL), our operations are aligned with New York and Philadelphia Fed calendars to ensure compliance and asset synchronization.
            </Typography>
            <Typography paragraph>
                Please note that our service is available only on business days according to NYSE and Philadelphia Fed Calendars, Monday through Friday. Additionally, due to the need for balance reconciliation across various channels, the service will be temporarily unavailable each day from 2:40 pm to 3:05 pm EST.
            </Typography>
            <Typography paragraph>
                We appreciate your understanding and encourage you to try again during our operating hours. Thank you for your patience and commitment to a secure, reliable service.
            </Typography>
        </DialogContent>
        <DialogActions>
            <Button onClick={onClose} color="primary">OK</Button>
        </DialogActions>
    </Dialog>
);

export default NotBusinessDayDialog;