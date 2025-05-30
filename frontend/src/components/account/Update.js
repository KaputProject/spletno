import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import {
    Box,
    Button,
    TextField,
    Typography,
    MenuItem,
    Paper,
    CircularProgress,
} from '@mui/material';

const URL = process.env.REACT_APP_BACKEND_URL;

const AccountUpdate = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const token = localStorage.getItem('token');

    const [iban, setIban] = useState('');
    const [balance, setBalance] = useState('');
    const [currency, setCurrency] = useState('EUR');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchAccount = async () => {
            try {
                const res = await axios.get(`${URL}/accounts/${id}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                const acc = res.data.account;
                setIban(acc.iban);
                setBalance(acc.balance);
                setCurrency(acc.currency);
                setLoading(false);
            } catch (err) {
                setError('Failed to load account data.');
                setLoading(false);
            }
        };

        fetchAccount();
    }, [id, token]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.put(`${URL}/accounts/${id}`,
                { iban, balance: parseFloat(balance), currency },
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            navigate(`/accounts/${id}`);
        } catch (err) {
            console.error('Error updating account:', err);
            setError('Failed to update account.');
        }
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box sx={{ width: '100%', mt: 2, px: 2 }}>
            <Box
                sx={{
                    maxWidth: 600,
                    margin: '0 auto',
                    p: 4,
                    borderRadius: 4,
                    backgroundColor: 'background.paper',
                    boxShadow: 3,
                    textAlign: 'center',
                }}
            >
                <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 2 }}>
                    Edit Account
                </Typography>

                <Typography sx={{ mb: 4 }}>
                    Modify the data below and save your changes.
                </Typography>

                {error && (
                    <Typography color="error" sx={{ mb: 2 }}>
                        {error}
                    </Typography>
                )}

                <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
                    <form onSubmit={handleSubmit}>
                        <TextField
                            fullWidth
                            label="IBAN"
                            value={iban}
                            onChange={(e) => setIban(e.target.value)}
                            sx={{ mb: 3 }}
                            required
                        />
                        <TextField
                            fullWidth
                            type="number"
                            label="Balance"
                            value={balance}
                            onChange={(e) => setBalance(e.target.value)}
                            sx={{ mb: 3 }}
                            required
                            inputProps={{ step: '0.01' }}
                        />
                        <TextField
                            select
                            fullWidth
                            label="Currency"
                            value={currency}
                            onChange={(e) => setCurrency(e.target.value)}
                            sx={{ mb: 3 }}
                            required
                        >
                            <MenuItem value="EUR">EUR</MenuItem>
                            <MenuItem value="USD">USD</MenuItem>
                            <MenuItem value="GBP">GBP</MenuItem>
                        </TextField>

                        <Button type="submit" variant="contained" color="primary" fullWidth>
                            Save Changes
                        </Button>
                    </form>
                </Paper>
            </Box>
        </Box>
    );
};

export default AccountUpdate;
