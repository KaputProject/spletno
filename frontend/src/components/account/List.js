import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
    Typography,
    Button,
    List,
    ListItem,
    ListItemText,
    Paper,
    Divider,
    Box,
} from '@mui/material';

const URL = process.env.REACT_APP_BACKEND_URL;

const AccountsList = () => {
    const [accounts, setAccounts] = useState([]);
    const navigate = useNavigate();
    const token = localStorage.getItem('token');

    useEffect(() => {
        const fetchAccounts = async () => {
            try {
                const res = await axios.get(`${URL}/accounts`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                setAccounts(res.data.accounts)
            } catch (error) {
                console.error('Error fetching accounts:', error);
            }
        };

        fetchAccounts();
    }, [token]);

    const handleCreateAccount = async () => {
        navigate('/accounts/create');
    };

    const handleAccountClick = (accountId) => {
        navigate(`/accounts/${accountId}`);
    };

    return (
        <Box sx={{
            width: '100%',
            mt: 2,
            px: 2 }}
        >
            <Box
                sx={{
                    margin: '0 auto',
                    textAlign: 'center',
                    p: 4,
                    borderRadius: 4,
                    backgroundColor: 'background.paper',
                    boxShadow: 3,
                }}
            >
                <Box
                    sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        mb: 2,
                    }}
                >
                    <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                        My Accounts
                    </Typography>
                    <Button variant="contained" color="primary" onClick={handleCreateAccount}>
                        Create Account
                    </Button>
                </Box>

                <Typography sx={{ mb: 4 }}>
                    View your account balances and IBAN details below. You can create a new account any time.
                </Typography>

                {accounts.length > 0 ? (
                    <Paper elevation={2}>
                        <List disablePadding>
                            {accounts.map((account, index) => (
                                <React.Fragment key={account._id}>
                                    <ListItem
                                        button
                                        onClick={() => handleAccountClick(account._id)}
                                        sx={{ py: 2, px: 3 }}
                                    >
                                        <ListItemText
                                            primary={
                                                <Typography variant="subtitle1" sx={{ fontWeight: 'medium' }}>
                                                    IBAN: {account.iban}
                                                </Typography>
                                            }
                                            secondary={
                                                <>
                                                    <Typography variant="body2">Currency: {account.currency}</Typography>
                                                    <Typography variant="body2">Balance: {account.balance}</Typography>
                                                </>
                                            }
                                        />
                                    </ListItem>
                                    {index < accounts.length - 1 && <Divider />}
                                </React.Fragment>
                            ))}
                        </List>
                    </Paper>
                ) : (
                    <Typography variant="body2" color="textSecondary">
                        No accounts found.
                    </Typography>
                )}
            </Box>
        </Box>
    );
};

export default AccountsList;
