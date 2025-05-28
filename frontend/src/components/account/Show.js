import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import {
    Typography,
    Button,
    Paper,
    List,
    Box,
    CircularProgress,
    ButtonGroup,
} from '@mui/material';
import StatementListItem from "../statement/ListItem";
import TransactionListItem from "../transaction/ListItem";

const URL = process.env.REACT_APP_BACKEND_URL;

const AccountShow = () => {
    const { id } = useParams();
    const [account, setAccount] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const token = localStorage.getItem('token');
    const [transactions, setTransactions] = useState([]);

    useEffect(() => {
        const fetchAccount = async () => {
            try {
                const res = await axios.get(`${URL}/accounts/${id}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                setAccount(res.data.account);
                setLoading(false);
            } catch (err) {
                setError('Failed to load account.');
                setLoading(false);
            }
        };
        fetchAccount();
    }, [id, token]);

    const handleDelete = () => async () => {
        if (window.confirm('Are you sure you want to delete this account?')) {
            try {
                await axios.delete(`${URL}/accounts/${id}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                navigate('/accounts');
            } catch (err) {
                setError('Failed to delete account.');
            }
        }
    }

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}>
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Box sx={{ mt: 4, textAlign: 'center' }}>
                <Typography color="error" variant="h6">{error}</Typography>
                <Button sx={{ mt: 2 }} onClick={() => navigate('/accounts')} variant="contained">
                    Back to Accounts
                </Button>
            </Box>
        );
    }

    if (!account) {
        return null;
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
                    borderRadius: 4,
                    backgroundColor: 'background.paper',
                    boxShadow: 3,
                }}
            >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                    <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                        Account Details
                    </Typography>
                    <ButtonGroup variant="outlined" aria-label="Account button group">
                        <Button onClick={() => navigate('/accounts')}>
                            Back
                        </Button>
                        <Button onClick={() => navigate(`/accounts/update/${id}`)}>
                            Edit Account
                        </Button>
                        <Button color="error" onClick={handleDelete()}>
                            Delete Account
                        </Button>
                    </ButtonGroup>
                </Box>

                <Typography variant="subtitle1" sx={{ mb: 1 }}>
                    <strong>IBAN:</strong> {account.iban}
                </Typography>
                <Typography variant="subtitle1" sx={{ mb: 1 }}>
                    <strong>Currency:</strong> {account.currency}
                </Typography>
                <Typography variant="subtitle1" sx={{ mb: 3 }}>
                    <strong>Balance:</strong> {account.balance.toFixed(2)}
                </Typography>

                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 4 }}>
                    <Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                            <Typography variant="h6">Statements</Typography>
                            <Button
                                variant="contained"
                                onClick={() => navigate(`/accounts/${id}/statements/create`)}
                            >
                                Add Statement
                            </Button>
                        </Box>

                        {account.statements && account.statements.length > 0 ? (
                            <Paper elevation={2}>
                                <List disablePadding>
                                    {account.statements.map((statement) => (
                                        <StatementListItem key={statement._id} statement={statement} />
                                    ))}
                                </List>
                            </Paper>
                        ) : (
                            <Typography variant="body2" color="textSecondary">
                                No statements found.
                            </Typography>
                        )}
                    </Box>

                    <Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                            <Typography variant="h6">Latest Transactions</Typography>
                            <Button
                                variant="contained"
                                onClick={() => navigate(`/accounts/${id}/transactions/create`)}
                            >
                                Add Transaction
                            </Button>
                        </Box>

                        {transactions.length > 0 ? (
                            <Paper elevation={2}>
                                <List disablePadding>
                                    {transactions.map((tx) => (
                                        <TransactionListItem key={tx._id} transaction={tx} />
                                    ))}
                                </List>
                            </Paper>
                        ) : (
                            <Typography variant="body2" color="textSecondary">
                                No recent transactions.
                            </Typography>
                        )}
                    </Box>
                </Box>
            </Box>
        </Box>
    );
};

export default AccountShow;
