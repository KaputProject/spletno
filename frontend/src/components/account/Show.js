import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import {
    Typography,
    Button,
    Paper,
    List,
    ListItem,
    ListItemText,
    Divider,
    Box,
    CircularProgress,
    ButtonGroup,
} from '@mui/material';

const URL = process.env.REACT_APP_BACKEND_URL;

const AccountShow = () => {
    const { id } = useParams();
    const [account, setAccount] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const token = localStorage.getItem('token');

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

                <Typography variant="h6" sx={{ mb: 2 }}>
                    Statements
                </Typography>
                {account.statements && account.statements.length > 0 ? (
                    <Paper elevation={2}>
                        <List disablePadding>
                            {account.statements.map((statement, idx) => (
                                <React.Fragment key={statement._id || idx}>
                                    <ListItem sx={{ py: 2, px: 3 }}>
                                        <ListItemText
                                            primary={`Date: ${new Date(statement.date).toLocaleDateString()}`}
                                            secondary={
                                                <>
                                                    <Typography component="span" variant="body2" color="textPrimary">
                                                        Amount: {statement.amount.toFixed(2)}
                                                    </Typography>
                                                    <br />
                                                    <Typography component="span" variant="body2" color="textSecondary">
                                                        {statement.description || 'No description'}
                                                    </Typography>
                                                </>
                                            }
                                        />
                                    </ListItem>
                                    {idx < account.statements.length - 1 && <Divider />}
                                </React.Fragment>
                            ))}
                        </List>
                    </Paper>
                ) : (
                    <Typography variant="body2" color="textSecondary">
                        No statements found.
                    </Typography>
                )}
            </Box>
        </Box>
    );
};

export default AccountShow;
