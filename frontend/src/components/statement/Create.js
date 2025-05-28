import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import axios from 'axios';
import dayjs from 'dayjs';
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

    const [selectedMonth, setSelectedMonth] = useState(dayjs());
    const [inflow, setInflow] = useState('');
    const [outflow, setOutflow] = useState('');
    const [startBalance, setStartBalance] = useState('');
    const [endBalance, setEndBalance] = useState('');
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            await axios.post(`${URL}/statements`, {
                accountId: accountId,
                inflow: parseFloat(inflow),
                outflow: parseFloat(outflow),
                startBalance: parseFloat(startBalance),
                endBalance: parseFloat(endBalance),
                month: selectedMonth.month(),
                year: selectedMonth.year()
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
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <DatePicker
                            views={['year', 'month']}
                            label="Select Month"
                            minDate={dayjs('2000-01-01')}
                            maxDate={dayjs()}
                            sx={{ mb: 2 }}
                            value={selectedMonth}
                            onChange={(newValue) => setSelectedMonth(newValue)}
                            renderInput={(params) => (
                                <TextField fullWidth sx={{ mb: 2 }} {...params} />
                            )}
                        />
                    </LocalizationProvider>

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
