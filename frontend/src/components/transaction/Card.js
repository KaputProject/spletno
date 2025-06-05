import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Card,
    CardContent,
    Typography,
    Box,
} from '@mui/material';

const TransactionCard = ({ title, transaction }) => {
    const navigate = useNavigate();
    const { _id, description, location, change, outgoing, original_location } = transaction;

    const locationParsed = location ? location.name : ( outgoing ? description : original_location);

    if (!transaction) {
        return (
            <Card sx={{ mb: 2, bgcolor: 'grey.100' }}>
                <CardContent>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        {title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        No data
                    </Typography>
                </CardContent>
            </Card>
        );
    }

    return (
        <Box
            onClick={() => navigate(`/transactions/${_id}`)}
            sx={{
                cursor: 'pointer',
                mb: 2,
                '&:hover': {
                    opacity: 0.85,
                },
            }}
        >
            <Card
                sx={{
                    boxShadow: 3,
                    borderRadius: 2,
                    transition: 'transform 0.2s ease',
                    '&:hover': {
                        transform: 'scale(1.03)',
                        boxShadow: 6,
                    },
                }}
                elevation={4}
            >
                <CardContent>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        {title}
                    </Typography>

                    <Typography variant="h7" fontWeight="bold" gutterBottom>
                        {locationParsed}
                    </Typography>

                    <Typography variant="body2" color="text.secondary" gutterBottom>
                        Description: {description || 'No Description'}
                    </Typography>

                    <Typography
                        variant="h7"
                        fontWeight="bold"
                        sx={{
                            color: outgoing
                                ? 'error.main'
                                : change > 0
                                    ? 'success.main'
                                    : 'text.primary',
                        }}
                    >
                        {outgoing ? '-' : '+'}${Math.abs(change).toFixed(2)}
                    </Typography>
                </CardContent>
            </Card>
        </Box>
    );
};

export default TransactionCard;
