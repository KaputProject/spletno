import React from 'react';
import { ListItem, ListItemText, Typography } from '@mui/material';

const TransactionListItem = ({ transaction }) => {
    return (
        <ListItem sx={{ py: 2, px: 3 }}>
            <ListItemText
                primary={
                    <Typography variant="subtitle1" sx={{ fontWeight: 'medium' }}>
                        Amount: {transaction.amount.toFixed(2)} {transaction.currency}
                    </Typography>
                }
                secondary={
                    <>
                        <Typography variant="body2">
                            {transaction.description || 'No description'}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                            {new Date(transaction.date).toLocaleString()}
                        </Typography>
                    </>
                }
            />
        </ListItem>
    );
};

export default TransactionListItem;
