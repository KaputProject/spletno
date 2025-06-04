import React from 'react';
import {
    Box,
    Typography,
    Grid,
    Paper,
    List,
} from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import TransactionListItem from './ListItem';

const TransactionParsed = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const transactions = location.state?.transactions || [];

    const withLocation = transactions.filter(tx => tx.location);
    const withoutLocation = transactions.filter(tx => !tx.location);

    const renderTransactionList = (txList) => (
        <Paper elevation={3} sx={{ width: '100%', overflow: 'hidden' }}>
            <List disablePadding>
                {txList.map((tx) => (
                    <TransactionListItem key={tx._id} transaction={tx} />
                ))}
            </List>
        </Paper>
    );

    return (
        <Box sx={{ width: '100%', mt: 4, px: { xs: 2, sm: 4 } }}>
            <Typography variant="h4" fontWeight="bold" gutterBottom>
                Uploaded Transactions
            </Typography>

            {transactions.length === 0 ? (
                <Typography>No transactions found from the upload.</Typography>
            ) : (
                <Grid container spacing={4}>
                    <Grid size={5} item xs={12} md={6}>
                        <Typography variant="h6" gutterBottom>
                            Associated with a location
                        </Typography>
                        {withLocation.length === 0 ? (
                            <Typography>No transactions with an associated location.</Typography>
                        ) : (
                            renderTransactionList(withLocation)
                        )}
                    </Grid>

                    <Grid size={7} item xs={12} md={6}>
                        <Typography variant="h6" gutterBottom>
                            Not associated with a location
                        </Typography>
                        {withoutLocation.length === 0 ? (
                            <Typography>No transactions without an associated location.</Typography>
                        ) : (
                            renderTransactionList(withoutLocation)
                        )}
                    </Grid>
                </Grid>
            )}
        </Box>
    );
};

export default TransactionParsed;
