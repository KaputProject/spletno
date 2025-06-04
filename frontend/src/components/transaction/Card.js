import React from 'react';
import {
    Card,
    CardContent,
    Typography,
    Box
} from '@mui/material';

const TransactionCard = ({ title, transaction }) => (
    <Card sx={{ mb: 2 }}>
        <CardContent>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                {title}
            </Typography>
            {transaction ? (
                <Box>
                    <Typography variant="body1" fontWeight="bold">
                        {transaction.description}
                    </Typography>
                    <Typography variant="body2">
                        Location: {transaction.location?.name || 'N/A'}
                    </Typography>
                    <Typography
                        variant="body2"
                        color={transaction.change >= 0 ? 'success.main' : 'error.main'}
                    >
                        Change: {transaction.change}
                    </Typography>
                </Box>
            ) : (
                <Typography variant="body2" color="text.secondary">
                    No data
                </Typography>
            )}
        </CardContent>
    </Card>
);

export default TransactionCard;
