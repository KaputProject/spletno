import React from 'react';
import {
    ListItem,
    ListItemText,
    Typography,
    Divider,
    Box,
    Chip,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

const TransactionListItem = ({ transaction }) => {
    const navigate = useNavigate();

    const handleClick = () => {
        navigate(`/transactions/${transaction._id}`);
    };

    const isOutgoing = transaction.outgoing;
    const amountColor = isOutgoing ? 'error.main' : 'success.main';
    const sign = isOutgoing ? '- ' : '+ ';
    const showColon = !!transaction.location?.name;
    const locationName = transaction.location?.name || '';

    const dateObj = new Date(transaction.datetime);
    const isMidnight =
        dateObj.getHours() === 0 &&
        dateObj.getMinutes() === 0 &&
        dateObj.getSeconds() === 0;
    const dateString = isMidnight
        ? dateObj.toLocaleDateString()
        : dateObj.toLocaleString();

    return (
        <>
            <ListItem
                button
                onClick={handleClick}
                sx={{
                    px: 3,
                    py: 1.2,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    gap: 0.5,
                    '&:hover': {
                        backgroundColor: 'action.hover',
                    },
                }}
            >
                <Box
                    sx={{
                        width: '100%',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                    }}
                >
                    <Typography
                        variant="subtitle1"
                        fontWeight="medium"
                        sx={{ color: amountColor }}
                    >
                        {locationName}
                        {showColon && ':'} {sign}
                        {transaction.change.toFixed(2)}{' '}
                        {transaction.account?.currency || ''}
                    </Typography>

                    {transaction.account?.iban && (
                        <Typography
                            variant="caption"
                            sx={{ fontFamily: 'monospace', color: 'text.secondary' }}
                        >
                            {transaction.account.iban}
                        </Typography>
                    )}
                </Box>

                <Box
                    sx={{
                        width: '100%',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                    }}
                >
                    <Typography variant="caption" color="text.secondary">
                        {dateString}
                    </Typography>

                    {(transaction.original_location && !transaction.location) && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <Typography
                                variant="caption"
                                color="text.secondary"
                                sx={{ whiteSpace: 'nowrap' }}
                            >
                                Location as written in statement:
                            </Typography>
                            <Chip
                                label={transaction.original_location}
                                size="small"
                                variant="outlined"
                            />
                        </Box>
                    )}
                </Box>
            </ListItem>
            <Divider component="li" />
        </>
    );
};

export default TransactionListItem;
