import React, { useEffect, useState } from 'react';
import {
    Box,
    Button,
    Typography,
    Paper,
    List,
    CircularProgress,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    TextField,
    Grid,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import TransactionListItem from './ListItem';
import TransactionSummary from './Summary';
import Autocomplete from '@mui/material/Autocomplete';

const URL = process.env.REACT_APP_BACKEND_URL;

const TransactionList = () => {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [locationFilter, setLocationFilter] = useState('');
    const [sortByChange, setSortByChange] = useState(null);
    const [sortByDate, setSortByDate] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');

    const navigate = useNavigate();
    const token = localStorage.getItem('token');

    useEffect(() => {
        const fetchTransactions = async () => {
            try {
                const res = await axios.get(`${URL}/transactions`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                setTransactions(res.data.transactions);
            } catch (err) {
                console.error(err);
                setError('Failed to load transactions.');
            } finally {
                setLoading(false);
            }
        };

        fetchTransactions();
    }, [token]);

    const uniqueLocations = [
        ...new Map(
            transactions
                .filter((tx) => tx.location)
                .map((tx) => [tx.location?._id, tx.location])
        ).values(),
    ];

    const filteredAndSortedTransactions = transactions
        .filter((tx) => {
            if (!locationFilter) return true;

            if (locationFilter === 'no_location') {
                return !tx.location;
            }

            return tx.location?._id === locationFilter;
        })
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

    const mostRecent = [...transactions].sort(
        (a, b) => new Date(b.date) - new Date(a.date)
    )[0];

    const biggestPositive = [...transactions]
        .filter((tx) => tx.change > 0 && !tx.outgoing)
        .sort((a, b) => b.change - a.change)[0];

    const biggestNegative = [...transactions]
        .filter((tx) => tx.change > 0 && tx.outgoing)
        .sort((a, b) => b.change - a.change)[0];


    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}>
                <CircularProgress size={48} />
            </Box>
        );
    }

    if (error) {
        return (
            <Typography color="error" sx={{ mt: 6, textAlign: 'center' }}>
                {error}
            </Typography>
        );
    }

    return (
        <Box sx={{ width: '100%', height: '100vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ flex: 1, overflow: 'hidden', px: 2, py: 2 }}>
                <Grid container spacing={2} sx={{ height: '100%' }}>
                    <Grid item size={9} sx={{ height: '100%' }}>
                        <Box
                            sx={{
                                p: 4,
                                borderRadius: 3,
                                backgroundColor: 'background.paper',
                                boxShadow: 4,
                                height: '100%',
                                display: 'flex',
                                flexDirection: 'column',
                            }}
                        >
                            <Box
                                sx={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    mb: 2,
                                    flexWrap: 'wrap',
                                    gap: 2,
                                }}
                            >
                                <Typography variant="h4" fontWeight="bold">
                                    Your Transactions
                                </Typography>
                                <Button
                                    variant="contained"
                                    size="medium"
                                    onClick={() => navigate('/transactions/create')}
                                >
                                    New Transaction
                                </Button>
                            </Box>

                            <Box
                                sx={{
                                    display: 'flex',
                                    gap: 2,
                                    flexWrap: 'wrap',
                                    alignItems: 'center',
                                    mb: 2,
                                }}
                            >
                                <Autocomplete
                                    size="small"
                                    sx={{ minWidth: 170 }}
                                    options={uniqueLocations}
                                    getOptionLabel={(option) => option.name}
                                    value={uniqueLocations.find((loc) => loc._id === locationFilter) || null}
                                    onChange={(event, newValue) => {
                                        setLocationFilter(newValue ? newValue._id : "");
                                    }}
                                    isOptionEqualToValue={(option, value) => option._id === value._id}
                                    renderInput={(params) => (
                                        <TextField {...params} label="Filter by Location" variant="outlined" />
                                    )}
                                    clearOnEscape
                                    includeInputInList
                                    autoHighlight
                                />

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
                                    sx={{ width: '160px' }}
                                    onClick={() =>
                                        setSortByDate((prev) =>
                                            prev === 'asc' ? 'desc' : prev === 'desc' ? null : 'asc'
                                        )
                                    }
                                >
                                    Sort by Date {sortByDate === 'asc' ? '↑' : sortByDate === 'desc' ? '↓' : ''}
                                </Button>
                            </Box>

                            <Box sx={{ flex: 1, overflowY: 'auto' }}>
                                {filteredAndSortedTransactions.length === 0 ? (
                                    <Typography>No transactions found.</Typography>
                                ) : (
                                    <Paper elevation={3} sx={{ width: '100%', overflow: 'hidden' }}>
                                        <List disablePadding>
                                            {filteredAndSortedTransactions.map((tx, index) => {
                                                if (!tx || !tx._id) return null;
                                                return <TransactionListItem key={tx._id || index} transaction={tx} />;
                                            })}
                                        </List>
                                    </Paper>
                                )}
                            </Box>
                        </Box>
                    </Grid>

                    <Grid item size={3} sx={{ height: '100%' }}>
                        <TransactionSummary
                            mostRecent={mostRecent}
                            biggestPositive={biggestPositive}
                            biggestNegative={biggestNegative}
                        />
                    </Grid>
                </Grid>
            </Box>
        </Box>
    );
};

export default TransactionList;
