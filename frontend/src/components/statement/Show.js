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
import TransactionListItem from "../transaction/ListItem";

const URL = process.env.REACT_APP_BACKEND_URL;

const StatementShow = () => {
    const { id } = useParams();
    const [statement, setStatement] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const token = localStorage.getItem('token');
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        const fetchStatement = async () => {
            try {
                const res = await axios.get(`${URL}/statements/${id}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setStatement(res.data.statement);
            } catch (err) {
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


    const handleDelete = async () => {
        if (!window.confirm('Are you sure you want to delete this statement?')) return;

        setDeleting(true);
        try {
            await axios.delete(`${URL}/statements/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            navigate('/statements');
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to delete statement.');
        } finally {
            setDeleting(false);
        }
    };

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
                    <ButtonGroup variant="outlined">
                        <Button onClick={() => navigate('/statements')}>Back</Button>
                        <Button onClick={() => navigate(`/statements/${id}/update`)}>Edit</Button>
                        <Button color="error" onClick={handleDelete} disabled={deleting}>
                            {deleting ? 'Deleting...' : 'Delete'}
                        </Button>

                    </ButtonGroup>


                </Box>

                <Divider sx={{ mb: 3 }} />

                {/* Dva stolpca: levi za tranzakcije, desni za info */}
                <Box sx={{ display: 'flex', gap: 4 }}>
                    {/* Levi stolpec: TRANSAKCIJE */}
                    <Box
                        sx={{
                            flex: 1,
                            maxHeight: '500px',
                            overflowY: 'auto',
                            pr: 2,
                            borderRight: '1px solid',
                            borderColor: 'divider',
                        }}
                    >
                        <Typography variant="h6" gutterBottom>
                            Transactions
                        </Typography>
                        {statement.transactions?.length > 0 ? (
                            statement.transactions.map((tx) => (
                                <TransactionListItem key={tx._id} transaction={tx} />
                            ))
                        ) : (
                            <Typography variant="body2" color="text.secondary">
                                No transactions found.
                            </Typography>
                        )}
                    </Box>

                    {/* Desni stolpec: INFO */}
                    <Box sx={{ flex: 1.5 }}>
                        <Typography variant="subtitle2" color="text.secondary">
                            Statement Period
                        </Typography>
                        <Typography variant="body1">
                            {formatDate(statement.startDate)} – {formatDate(statement.endDate)}
                        </Typography>

                        <Box sx={{ mt: 2 }}>
                            <Typography variant="subtitle2" color="text.secondary">
                                Month / Year
                            </Typography>
                            <Typography variant="body1">
                                {statement.month + 1} / {statement.year}
                            </Typography>
                        </Box>

                        <Box sx={{ mt: 2 }}>
                            <Typography variant="subtitle2" color="text.secondary">
                                Account
                            </Typography>
                            {statement.account ? (
                                <Link
                                    component="button"
                                    variant="body1"
                                    onClick={() =>
                                        navigate(`/accounts/${statement.account._id}`)
                                    }
                                >
                                    {statement.account.iban}
                                </Link>
                            ) : (
                                <Typography variant="body1">N/A</Typography>
                            )}
                        </Box>

                        <Box sx={{ mt: 2 }}>
                            <Typography variant="subtitle2" color="text.secondary">
                                User
                            </Typography>
                            <Typography variant="body1">
                                {statement.user?.email || statement.user || 'N/A'}
                            </Typography>
                        </Box>

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
                    </Box>
                </Box>
            </Paper>
        </Box>
    );
};

export default StatementShow;
