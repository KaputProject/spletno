import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
    Box,
    Button,
    TextField,
    Typography,
    MenuItem,
    Paper,
} from '@mui/material';

const URL = process.env.REACT_APP_BACKEND_URL;

const CreateAccount = () => {
    const [iban, setIban] = useState('');
    const [balance, setBalance] = useState('');
    const [currency, setCurrency] = useState('EUR');
    const navigate = useNavigate();
    const token = localStorage.getItem('token');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post(
                `${URL}/accounts`,
                { iban, balance: parseFloat(balance), currency },
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            navigate(`/accounts/${response.data.account._id}`);
        } catch (error) {
            console.error('Error creating account:', error);
        }
    };

    if (!token) {
        navigate('/login');
    }

    return (
        <Box sx={{
            width: '100%',
            mt: 2,
            px: 2
        }}>
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
                    Create a New Account
                </Typography>

                <Typography sx={{ mb: 4 }}>
                    Enter the details below to open a new account.
                </Typography>

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
                            label="Initial Balance"
                            value={balance}
                            onChange={(e) => setBalance(e.target.value)}
                            sx={{ mb: 3 }}
                            required
                            inputProps={{ step: "0.01" }}
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
                            Create Account
                        </Button>
                    </form>
                </Paper>
            </Box>
        </Box>
    );
};

export default CreateAccount;
