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
    Grid, FormControl, InputLabel, Select, MenuItem, TextField
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
    const [locationFilter, setLocationFilter] = useState('');
    const [sortByChange, setSortByChange] = useState(null);
    const [sortByDate, setSortByDate] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');


    useEffect(() => {
        const fetchAccount = async () => {
            try {
                const res = await axios.get(`${URL}/accounts/${id}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setAccount(res.data.account);

                const resT = await axios.get(`${URL}/transactions?account=${id}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setTransactions(resT.data.transactions);

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

    const uniqueLocations = [
        ...new Map(
            transactions
                .filter((tx) => tx.location)
                .map((tx) => [tx.location._id, tx.location])
        ).values(),
    ];

    const filteredAndSortedTransactions = transactions
        .filter((tx) =>
            locationFilter ? tx.location?._id === locationFilter : true
        )
        .filter((tx) => {
            const lowerQuery = searchQuery.toLowerCase();
            const locationName = tx.location?.name?.toLowerCase() || '';
            const description = tx.description?.toLowerCase() || '';
            const originalLocation = tx.original_location?.toLowerCase() || '';
            const changeStr = String(tx.change || '').toLowerCase();
            return (
                locationName.includes(lowerQuery) ||
                description.includes(lowerQuery) ||
                changeStr.includes(lowerQuery) ||
                originalLocation.includes(lowerQuery)
            );
        })
        .sort((a, b) => {
            if (sortByChange) {
                return sortByChange === 'asc' ? a.change - b.change : b.change - a.change;
            } else if (sortByDate) {
                return sortByDate === 'asc'
                    ? new Date(a.datetime) - new Date(b.datetime)
                    : new Date(b.datetime) - new Date(a.datetime);
            }
            return 0;
        });

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
                        <Button onClick={() => navigate(`/accounts/${id}/update`)}>
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

                <Grid container spacing={4}>
                    <Grid item size={4}>
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
                    </Grid>

                    <Grid item size={8}>
                        <Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                <Typography variant="h6">Latest Transactions</Typography>
                                <Button
                                    variant="contained"
                                    onClick={() => navigate(`/transactions/create`)}
                                >
                                    Add Transaction
                                </Button>
                            </Box>

                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 1 }}>
                                <FormControl sx={{ minWidth: 120 }} size="small">
                                    <InputLabel id="location-filter-label">Location</InputLabel>
                                    <Select
                                        labelId="location-filter-label"
                                        value={locationFilter}
                                        label="Filter by Location"
                                        onChange={(e) => setLocationFilter(e.target.value)}
                                    >
                                        <MenuItem value="">All Locations</MenuItem>
                                        {uniqueLocations.map((loc) => (
                                            <MenuItem key={loc._id} value={loc._id}>
                                                {loc.name}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>

                                <TextField
                                    label="Search"
                                    variant="outlined"
                                    size="small"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    sx={{ flexGrow: 1, minWidth: 160 }}
                                />

                                <Button
                                    variant="outlined"
                                    size="medium"
                                    onClick={() =>
                                        setSortByChange((prev) =>
                                            prev === 'asc' ? 'desc' : prev === 'desc' ? null : 'asc'
                                        )
                                    }
                                >
                                    Sort by Amount {sortByChange === 'asc' ? '↑' : sortByChange === 'desc' ? '↓' : ''}
                                </Button>

                                <Button
                                    variant="outlined"
                                    size="medium"
                                    onClick={() =>
                                        setSortByDate((prev) =>
                                            prev === 'asc' ? 'desc' : prev === 'desc' ? null : 'asc'
                                        )
                                    }
                                >
                                    Sort by Date {sortByDate === 'asc' ? '↑' : sortByDate === 'desc' ? '↓' : ''}
                                </Button>
                            </Box>


                            {filteredAndSortedTransactions && filteredAndSortedTransactions.length > 0 ? (
                                <Paper elevation={2}>
                                    <List disablePadding>
                                        {filteredAndSortedTransactions.map((tx) => (
                                            <TransactionListItem key={tx._id} transaction={tx} />
                                        ))}
                                    </List>
                                </Paper>
                            ) : (
                                <Typography variant="body2" color="textSecondary">
                                    No transactions found.
                                </Typography>
                            )}
                        </Box>
                    </Grid>
                </Grid>
            </Box>
        </Box>
    );
};

export default AccountShow;
