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
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
} from '@mui/material';

const URL = process.env.REACT_APP_BACKEND_URL;

const AccountsList = () => {
    const [accounts, setAccounts] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [currencyFilter, setCurrencyFilter] = useState('');
    const [sortByBalance, setSortByBalance] = useState(null);

    const navigate = useNavigate();
    const token = localStorage.getItem('token');

    useEffect(() => {
        const fetchAccounts = async () => {
            try {
                const res = await axios.get(`${URL}/accounts`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setAccounts(res.data.accounts);
            } catch (error) {
                console.error('Error fetching accounts:', error);
            }
        };
        fetchAccounts();
    }, [token]);

    const handleCreateAccount = () => navigate('/accounts/create');

    const handleAccountClick = (accountId) => {
        navigate(`/accounts/${accountId}`);
    };

    const filteredAccounts = accounts
        .filter((acc) => {
            const matchQuery = acc.iban.toLowerCase().includes(searchQuery.toLowerCase());
            const matchCurrency = currencyFilter ? acc.currency === currencyFilter : true;
            return matchQuery && matchCurrency;
        })
        .sort((a, b) => {
            if (sortByBalance === 'asc') return a.balance - b.balance;
            if (sortByBalance === 'desc') return b.balance - a.balance;
            return 0;
        });

    return (
        <Box sx={{ width: '100%', mt: 2, px: 2 }}>
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
                        flexWrap: 'wrap',
                        gap: 2,
                    }}
                >
                    <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                        My Accounts
                    </Typography>
                    <Button variant="contained" color="primary" onClick={handleCreateAccount}>
                        Create Account
                    </Button>
                </Box>

                <Typography sx={{ mb: 3 }}>
                    View your accounts below. You can also create a new account any time.
                </Typography>

                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2,
                        mb: 1,
                        pt: 1,
                        width: '100%',
                        flexWrap: 'nowrap',
                        overflowX: 'auto',
                    }}
                >
                    <TextField
                        label="Search by IBAN"
                        variant="outlined"
                        fullWidth={true}
                        size="small"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        sx={{ minWidth: 200 }}
                    />

                    <FormControl size="small" sx={{ minWidth: 160 }}>
                        <InputLabel id="currency-filter-label">Currency</InputLabel>
                        <Select
                            labelId="currency-filter-label"
                            value={currencyFilter}
                            label="Currency"
                            onChange={(e) => setCurrencyFilter(e.target.value)}
                        >
                            <MenuItem value="">All</MenuItem>
                            <MenuItem value="EUR">EUR</MenuItem>
                            <MenuItem value="USD">USD</MenuItem>
                            <MenuItem value="GBP">GBP</MenuItem>
                        </Select>
                    </FormControl>

                    <Button
                        variant="outlined"
                        size="normal"
                        sx={{ minWidth: 180 }}
                        onClick={() =>
                            setSortByBalance((prev) =>
                                prev === 'asc' ? 'desc' : prev === 'desc' ? null : 'asc'
                            )
                        }
                    >
                        Sort by Balance {sortByBalance === 'asc' ? '↑' : sortByBalance === 'desc' ? '↓' : ''}
                    </Button>
                </Box>

                {filteredAccounts.length > 0 ? (
                    <Paper elevation={2}>
                        <List disablePadding>
                            {filteredAccounts.map((account, index) => (
                                <React.Fragment key={account._id}>
                                    <ListItem
                                        button
                                        onClick={() => handleAccountClick(account._id)}
                                        sx={{ py: 2, px: 3, display: 'flex', alignItems: 'center' }}
                                    >
                                        <Box>
                                            <Typography variant="subtitle1" sx={{ fontWeight: 'medium' }}>
                                                IBAN: {account.iban}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                Currency: {account.currency}
                                            </Typography>
                                        </Box>

                                        <Box sx={{ marginLeft: 'auto', textAlign: 'right' }}>
                                            <Typography variant="subtitle1" sx={{ fontWeight: 'medium' }}>
                                                Balance: {account.balance.toFixed(2)}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                Statements: {account.statements.length ?? 0}
                                            </Typography>
                                        </Box>
                                    </ListItem>

                                    {index < filteredAccounts.length - 1 && <Divider />}
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
