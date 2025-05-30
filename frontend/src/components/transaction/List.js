import React, { useEffect, useState } from 'react';
import {
    Box,
    Button,
    Typography,
    Paper,
    List,
    ListItem,
    CircularProgress,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const URL = process.env.REACT_APP_BACKEND_URL;

const TransactionList = () => {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const token = localStorage.getItem('token');

    useEffect(() => {
        const fetchTransactions = async () => {
            try {
                const res = await axios.get(`${URL}/transactions`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setTransactions(res.data.transactions);
            } catch (err) {
                console.error(err);
                setError('Failed to load transactions.');
            } finally {
                setLoading(false);
            }
        };

        fetchTransactions();
    }, [token]);

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}>
                <CircularProgress size={48} />
            </Box>
        );
    }

    if (error) {
        return (
            <Typography color="error" sx={{ mt: 6, textAlign: 'center' }}>
                {error}
            </Typography>
        );
    }

    return (
        <Box sx={{
            width: '100%',
            mt: 2,
            px: 2 
        }}>
            <Box
                sx={{
                    margin: '0 auto',
                    p: 4,
                    borderRadius: 3,
                    backgroundColor: 'background.paper',
                    boxShadow: 4,
                }}
            >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                    <Typography variant="h4" fontWeight="bold">
                        Your Transactions
                    </Typography>
                    <Button
                        variant="contained"
                        onClick={() => navigate('/transactions/create')}
                    >
                        New Transaction
                    </Button>
                </Box>

                {transactions.length === 0 ? (
                    <Typography>No transactions found.</Typography>
                ) : (
                    <Paper elevation={3}>
                        <List>
                            {transactions.map((tx) => {
                                const amountColor = tx.outgoing ? 'error.main' : 'success.main';
                                const sign = tx.outgoing ? '- ' : '+ ';
                                const dateString = new Date(tx.datetime).toLocaleString();
                                const locationName = tx.location?.name || 'Unknown Location';
                                const currency = tx.account?.currency || '';
                                const iban = tx.account?.iban || 'N/A';

                                return (
                                    <ListItem
                                        key={tx._id}
                                        divider
                                        button
                                        onClick={() => navigate(`/transactions/${tx._id}`)}
                                        sx={{
                                            flexDirection: 'column',
                                            alignItems: 'flex-start',
                                            py: 1.5,
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
                                                sx={{ color: amountColor, fontWeight: 'medium' }}
                                            >
                                                {locationName}: {sign}
                                                {tx.change.toFixed(2)} {currency}
                                            </Typography>

                                            <Typography
                                                variant="body2"
                                                color="text.secondary"
                                                sx={{ fontFamily: 'monospace' }}
                                            >
                                                {iban}
                                            </Typography>
                                        </Box>

                                        <Typography
                                            variant="body2"
                                            color="text.secondary"
                                            sx={{ mt: 0.5 }}
                                        >
                                            {dateString}
                                        </Typography>
                                    </ListItem>
                                );
                            })}
                        </List>
                    </Paper>
                )}
            </Box>
        </Box>
    );
};

export default TransactionList;
