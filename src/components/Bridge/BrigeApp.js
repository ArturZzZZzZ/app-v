import React from 'react';
import {Box,  Paper } from '@mui/material';

import WalletDisplay from '../../utils/WalletDisplay';
import Bridge from './components/Bridge';

const BridgeApp = ({ network1, network2 }) => {
    // Bridge styles for common UI consistency
    const bridgeStyles = {
        Appcontainer: {
            display: 'flex',
            flexDirection: 'column',
            padding: 0,
            borderRadius: 0,
            gap: '1em',
            paddingBottom: '2em'
        },
    };

    return (
        <Paper sx={bridgeStyles.Appcontainer}>
            <Box display="flex" justifyContent="space-between" alignItems="center" backgroundColor="#dadada" paddingLeft='1em' >
                <h1 color='#727272'> Bridge </h1>
                <Box display="flex" justifyContent="flex-end" alignItems="center" >
                    <WalletDisplay />
                </Box>
            </Box>
            <Bridge network1={network1} network2={network2} />
        </Paper>
    );
};

export default BridgeApp;