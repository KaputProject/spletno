import React from 'react';
import { Divider, ListItem, ListItemText, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const TransactionListItem = ({ transaction }) => {
    const navigate = useNavigate();

    const handleClick = () => {
        navigate(`/transactions/${transaction._id}`);
    };

    return (
        <>
            <ListItem
                button
                sx={{ py: 2, px: 3, cursor: 'pointer' }}
                onClick={handleClick}
            >
                <ListItemText
                    primary={
                        <Typography
                            variant="subtitle1"
                            sx={{
                                fontWeight: 'medium',
                                color: transaction.outgoing ? 'error.main' : 'success.main',
                            }}
                        >
                            {transaction.location?.name || 'Unknown'}: {transaction.outgoing ? '- ' : '+ '}
                            {transaction.change.toFixed(2)}
                        </Typography>
                    }
                    secondary={
                        <Typography variant="caption" color="textSecondary" sx={{ display: 'block' }}>
                            {new Date(transaction.datetime).toLocaleString()}
                        </Typography>
                    }
                />
            </ListItem>
            <Divider />
        </>
    );
};

export default TransactionListItem;
