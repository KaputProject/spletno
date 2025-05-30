import React, { useEffect, useState } from 'react';
import {
    Box,
    Typography,
    Button,
    Paper,
    CircularProgress,
    ButtonGroup,
    Divider,
    Link,
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const URL = process.env.REACT_APP_BACKEND_URL;

const TransactionShow = () => {
    const { id } = useParams();
    const [transaction, setTransaction] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const token = localStorage.getItem('token');

    useEffect(() => {
        const fetchTransaction = async () => {
            try {
                const res = await axios.get(`${URL}/transactions/${id}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setTransaction(res.data.transaction);
            } catch (err) {
                console.error(err);
                setError('Failed to load transaction.');
            } finally {
                setLoading(false);
            }
        };

        fetchTransaction();
    }, [id, token]);

    const handleDelete = () => async () => {
        if (window.confirm('Are you sure you want to delete this transaction?')) {
            try {
                await axios.delete(`${URL}/transactions/${id}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                navigate('/transactions');
            } catch {
                setError('Failed to delete transaction.');
            }
        }
    };

    if (loading)
        return (
            <Box sx={{ mt: 6, display: 'flex', justifyContent: 'center' }}>
                <CircularProgress size={48} />
            </Box>
        );

    if (error)
        return (
            <Box sx={{ mt: 6, textAlign: 'center' }}>
                <Typography color="error" variant="h6" gutterBottom>
                    {error}
                </Typography>
                <Button variant="contained" onClick={() => navigate('/transactions')}>
                    Back to Transactions
                </Button>
            </Box>
        );

    if (!transaction) return null;

    return (
        <Box sx={{ mt: 2, px: 2 }}>
            <Paper
                elevation={4}
                sx={{
                    p: 4,
                    borderRadius: 3,
                    bgcolor: 'background.paper',
                    boxShadow: 6,
                }}
            >
                <Box
                    sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        mb: 3,
                    }}
                >
                    <Typography variant="h4" fontWeight="bold">
                        Transaction Details
                    </Typography>
                    <ButtonGroup variant="outlined" aria-label="transaction actions">
                        <Button onClick={() => navigate('/transactions')}>Back</Button>
                        <Button onClick={() => navigate(`/transactions/${id}/update`)}>Edit</Button>
                        <Button color="error" onClick={handleDelete()}>
                            Delete
                        </Button>
                    </ButtonGroup>
                </Box>

                <Divider sx={{ mb: 3 }} />

                <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        Date
                    </Typography>
                    <Typography variant="body1">
                        {new Date(transaction.datetime).toLocaleString()}
                    </Typography>
                </Box>

                <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        Description
                    </Typography>
                    <Typography variant="body1">{transaction.description || 'N/A'}</Typography>
                </Box>

                <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        Change
                    </Typography>
                    <Typography
                        variant="h6"
                        sx={{ color: transaction.outgoing ? 'error.main' : 'success.main' }}
                    >
                        {transaction.outgoing ? '- ' : '+ '}
                        {transaction.change.toFixed(2)}
                    </Typography>
                </Box>

                <Box sx={{ mb: 2, display: 'flex', gap: 4 }}>
                    <Box>
                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                            Reference
                        </Typography>
                        <Typography variant="body1">{transaction.reference || 'N/A'}</Typography>
                    </Box>
                </Box>

                <Box sx={{ mb: 2, display: 'flex', gap: 4 }}>
                    <Box>
                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                            Account IBAN
                        </Typography>
                        {transaction.account ? (
                            <Link
                                component="button"
                                variant="body1"
                                onClick={() => navigate(`/accounts/${transaction.account._id}`)}
                                sx={{ cursor: 'pointer' }}
                            >
                                {transaction.account.iban}
                            </Link>
                        ) : (
                            <Typography variant="body1">N/A</Typography>
                        )}
                    </Box>

                    <Box>
                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                            Location
                        </Typography>
                        {transaction.location ? (
                            <Link
                                component="button"
                                variant="body1"
                                onClick={() => navigate(`/locations/${transaction.location._id}`)}
                                sx={{ cursor: 'pointer' }}
                            >
                                {transaction.location.name}
                            </Link>
                        ) : (
                            <Typography variant="body1">N/A</Typography>
                        )}
                    </Box>
                </Box>
            </Paper>
        </Box>
    );
};

export default TransactionShow;
