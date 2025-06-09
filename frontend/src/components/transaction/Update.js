import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
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

const TransactionUpdate = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const token = localStorage.getItem('token');

    const [accounts, setAccounts] = useState([]);
    const [locations, setLocations] = useState([]);

    const [form, setForm] = useState({
        user: '',
        account: '',
        datetime: '',
        location: '',
        description: '',
        change: '',
        balanceAfter: '',
        outgoing: true,
        known_location: false,
        location_parsed: ''
    });

    useEffect(() => {
        if (!token) {
            navigate('/login');
            return;
        }

        const fetchData = async () => {
            try {
                const [accountsRes, locationsRes, transactionRes] = await Promise.all([
                    axios.get(`${URL}/accounts`, {
                        headers: { Authorization: `Bearer ${token}` }
                    }),
                    axios.get(`${URL}/locations`, {
                        headers: { Authorization: `Bearer ${token}` }
                    }),
                    axios.get(`${URL}/transactions/${id}`, {
                        headers: { Authorization: `Bearer ${token}` }
                    }),
                ]);

                setAccounts(accountsRes.data.accounts || []);
                setLocations(locationsRes.data.locations || []);

                const tx = transactionRes.data.transaction;
                setForm({
                    user: tx.user || '',
                    account: tx.account || '',
                    datetime: tx.datetime?.slice(0, 16) || '',
                    location: tx.location || '',
                    description: tx.description || '',
                    change: tx.change || '',
                    balanceAfter: tx.balanceAfter || '',
                    outgoing: tx.outgoing,
                    known_location: tx.known_location || false,
                    location_parsed: tx.location_parsed || ''
                });
            } catch (err) {
                console.error('Error loading data:', err);
            }
        };

        fetchData();
    }, [id, token, navigate]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm({
            ...form,
            [name]: type === 'checkbox' ? checked : value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            await axios.put(`${URL}/transactions/${id}`, {
                ...form,
                change: parseFloat(form.change),
                balanceAfter: parseFloat(form.balanceAfter),
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            navigate(`/transactions/${id}`);
        } catch (err) {
            console.error('Error updating transaction:', err);
        }
    };

    return (
        <Box sx={{ width: '100%', mt: 2, px: 2 }}>
            <Box
                sx={{
                    maxWidth: 700,
                    margin: '0 auto',
                    p: 4,
                    borderRadius: 4,
                    backgroundColor: 'background.paper',
                    boxShadow: 3,
                    textAlign: 'center',
                }}
            >
                <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 2 }}>
                    Update Transaction
                </Typography>

                <Typography sx={{ mb: 4 }}>
                    Update the transaction details below.
                </Typography>

                <Paper elevation={2} sx={{ p: 3, borderRadius: 2, textAlign: 'left' }}>
                    <form onSubmit={handleSubmit}>
                        <TextField
                            select
                            fullWidth
                            label="Account"
                            name="account"
                            value={form.account}
                            onChange={handleChange}
                            sx={{ mb: 3 }}
                            required
                        >
                            {accounts.map((acc) => (
                                <MenuItem key={acc._id} value={acc._id}>
                                    {acc.iban || acc._id}
                                </MenuItem>
                            ))}
                        </TextField>

                        <TextField
                            select
                            fullWidth
                            label="Location"
                            name="location"
                            value={form.location}
                            onChange={handleChange}
                            sx={{ mb: 3 }}
                        >
                            {locations.map((loc) => (
                                <MenuItem key={loc._id} value={loc._id}>
                                    {loc.name || loc._id}
                                </MenuItem>
                            ))}
                        </TextField>

                        <TextField
                            fullWidth
                            type="datetime-local"
                            label="Date and Time"
                            name="datetime"
                            value={form.datetime}
                            onChange={handleChange}
                            sx={{ mb: 3 }}
                            InputLabelProps={{ shrink: true }}
                        />
                        <TextField
                            fullWidth
                            label="Description"
                            name="description"
                            value={form.description}
                            onChange={handleChange}
                            sx={{ mb: 3 }}
                        />
                        <TextField
                            fullWidth
                            type="number"
                            label="Amount Change"
                            name="change"
                            value={form.change}
                            onChange={handleChange}
                            sx={{ mb: 3 }}
                            inputProps={{ step: "0.01", min: "0" }}
                            required
                        />
                        <TextField
                            select
                            fullWidth
                            label="Transaction Direction"
                            name="outgoing"
                            value={form.outgoing ? "true" : "false"}
                            onChange={(e) =>
                                setForm((prev) => ({
                                    ...prev,
                                    outgoing: e.target.value === "true"
                                }))
                            }
                            sx={{ mb: 3 }}
                        >
                            <MenuItem value="true">Outgoing</MenuItem>
                            <MenuItem value="false">Incoming</MenuItem>
                        </TextField>

                        <Button type="submit" variant="contained" color="primary" fullWidth>
                            Update Transaction
                        </Button>
                    </form>
                </Paper>
            </Box>
        </Box>
    );
};

export default TransactionUpdate;
