import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import {
    Box,
    Typography,
    TextField,
    Button,
    Paper
} from '@mui/material';

const URL = process.env.REACT_APP_BACKEND_URL;

const StatementCreate = () => {
    const { id: accountId } = useParams();
    const navigate = useNavigate();
    const token = localStorage.getItem('token');

    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [inflow, setInflow] = useState('');
    const [outflow, setOutflow] = useState('');
    const [startBalance, setStartBalance] = useState('');
    const [endBalance, setEndBalance] = useState('');
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            await axios.post(`${URL}/statements`, {
                account: accountId,
                startDate,
                endDate,
                inflow: parseFloat(inflow),
                outflow: parseFloat(outflow),
                startBalance: parseFloat(startBalance),
                endBalance: parseFloat(endBalance)
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            navigate(`/accounts/${accountId}`);
        } catch (err) {
            setError('Failed to create statement.');
        }
    };

    return (
        <Box sx={{ mt: 4, px: 2 }}>
            <Paper sx={{ p: 4, maxWidth: 600, mx: 'auto' }}>
                <Typography variant="h5" sx={{ mb: 3 }}>
                    Create Statement
                </Typography>

                {error && (
                    <Typography color="error" sx={{ mb: 2 }}>
                        {error}
                    </Typography>
                )}

                <form onSubmit={handleSubmit}>
                    <TextField
                        label="Start Date"
                        type="date"
                        fullWidth
                        InputLabelProps={{ shrink: true }}
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        sx={{ mb: 2 }}
                        required
                    />
                    <TextField
                        label="End Date"
                        type="date"
                        fullWidth
                        InputLabelProps={{ shrink: true }}
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        sx={{ mb: 2 }}
                        required
                    />
                    <TextField
                        label="Inflow"
                        type="number"
                        fullWidth
                        value={inflow}
                        onChange={(e) => setInflow(e.target.value)}
                        sx={{ mb: 2 }}
                        required
                    />
                    <TextField
                        label="Outflow"
                        type="number"
                        fullWidth
                        value={outflow}
                        onChange={(e) => setOutflow(e.target.value)}
                        sx={{ mb: 2 }}
                        required
                    />
                    <TextField
                        label="Start Balance"
                        type="number"
                        fullWidth
                        value={startBalance}
                        onChange={(e) => setStartBalance(e.target.value)}
                        sx={{ mb: 2 }}
                        required
                    />
                    <TextField
                        label="End Balance"
                        type="number"
                        fullWidth
                        value={endBalance}
                        onChange={(e) => setEndBalance(e.target.value)}
                        sx={{ mb: 3 }}
                        required
                    />

                    <Button type="submit" variant="contained" fullWidth>
                        Save Statement
                    </Button>
                </form>
            </Paper>
        </Box>
    );
};

export default StatementCreate;
