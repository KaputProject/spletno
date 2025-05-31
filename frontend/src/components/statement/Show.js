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

const StatementShow = () => {
    const { id } = useParams();
    const [statement, setStatement] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const token = localStorage.getItem('token');

    useEffect(() => {
        const fetchStatement = async () => {
            try {
                const res = await axios.get(`${URL}/statements/${id}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setStatement(res.data.statement);
            } catch (err) {
                console.error(err);
                setError(err.response?.data?.message || 'Failed to load statement.');
            } finally {
                setLoading(false);
            }
        };

        fetchStatement();
    }, [id, token]);

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
                <Button variant="contained" onClick={() => navigate('/statements')}>
                    Back to Statements
                </Button>
            </Box>
        );

    if (!statement) return null;

    const formatDate = (dateStr) =>
        dateStr ? new Date(dateStr).toLocaleDateString() : 'N/A';

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
                        Statement Details
                    </Typography>
                    <ButtonGroup variant="outlined" aria-label="statement actions">
                        <Button onClick={() => navigate('/statements')}>Back</Button>
                        <Button onClick={() => navigate(`/statements/${id}/update`)}>Edit</Button>
                    </ButtonGroup>
                </Box>

                <Divider sx={{ mb: 3 }} />

                {/* Basic Info */}
                <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" color="text.secondary">
                        Statement Period
                    </Typography>
                    <Typography variant="body1">
                        {formatDate(statement.startDate)} – {formatDate(statement.endDate)}
                    </Typography>
                </Box>

                <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" color="text.secondary">
                        Month / Year
                    </Typography>
                    <Typography variant="body1">
                        {statement.month + 1} / {statement.year}
                    </Typography>
                </Box>

                {/* Account and User Info */}
                <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" color="text.secondary">
                        Account
                    </Typography>
                    {statement.account ? (
                        <Link
                            component="button"
                            variant="body1"
                            onClick={() => navigate(`/accounts/${statement.account._id}`)}
                        >
                            {statement.account.iban}
                        </Link>
                    ) : (
                        <Typography variant="body1">N/A</Typography>
                    )}
                </Box>

                <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" color="text.secondary">
                        User
                    </Typography>
                    <Typography variant="body1">
                        {statement.user?.username || 'N/A'}
                    </Typography>
                </Box>

                {/* Financial Summary */}
                <Box sx={{ mt: 3 }}>
                    <Typography variant="subtitle2" color="text.secondary">
                        Balances
                    </Typography>
                    <Typography variant="body1">
                        Start: {statement.startBalance.toFixed(2)} €
                    </Typography>
                    <Typography variant="body1">
                        End: {statement.endBalance.toFixed(2)} €
                    </Typography>
                </Box>

                <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle2" color="text.secondary">
                        Inflow / Outflow
                    </Typography>
                    <Typography variant="body1" color="success.main">
                        Inflow: +{statement.inflow.toFixed(2)} €
                    </Typography>
                    <Typography variant="body1" color="error.main">
                        Outflow: -{statement.outflow.toFixed(2)} €
                    </Typography>
                </Box>

                {/* Transactions */}
                {statement.transactions?.length > 0 && (
                    <Box sx={{ mt: 3 }}>
                        <Typography variant="subtitle2" color="text.secondary">
                            Transactions
                        </Typography>
                        {statement.transactions.map((tx) => (
                            <Typography key={tx._id} variant="body2" sx={{ ml: 2 }}>
                                • {tx.description || 'No description'} —{' '}
                                {tx.change?.toFixed(2)} €
                            </Typography>
                        ))}
                    </Box>
                )}
            </Paper>
        </Box>
    );
};

export default StatementShow;
