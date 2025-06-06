import React, { useEffect, useState } from 'react';
import {
    Box,
    Typography,
    Button,
    Paper,
    CircularProgress,
    ButtonGroup,
    Divider,
    Grid,
    List,
    TextField,
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import TransactionListItem from '../transaction/ListItem';
import { GoogleMap, Marker, useJsApiLoader } from '@react-google-maps/api';

const URL = process.env.REACT_APP_BACKEND_URL;
const GOOGLE_MAPS_API_KEY = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;

const mapContainerStyle = {
    width: '100%',
    height: '100%',
};

const LocationShow = () => {
    const { id } = useParams();
    const [location, setLocation] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [sortByChange, setSortByChange] = useState(null);
    const [sortByDate, setSortByDate] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');

    const navigate = useNavigate();
    const token = localStorage.getItem('token');

    const { isLoaded } = useJsApiLoader({
        googleMapsApiKey: GOOGLE_MAPS_API_KEY,
    });

    useEffect(() => {
        const fetchLocation = async () => {
            try {
                const res = await axios.get(`${URL}/locations/${id}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setLocation(res.data.partner);
            } catch (err) {
                console.error(err);
                setError('Failed to load location.');
            } finally {
                setLoading(false);
            }
        };
        fetchLocation();
    }, [id, token]);

    const transactions = location?.transactions || [];

    const filteredAndSortedTransactions = transactions
        .filter((tx) => {
            const lowerQuery = searchQuery.toLowerCase();
            const locationName = tx.location?.name?.toLowerCase() || '';
            const description = tx.description?.toLowerCase() || '';
            const changeStr = String(tx.change || '').toLowerCase();
            return (
                locationName.includes(lowerQuery) ||
                description.includes(lowerQuery) ||
                changeStr.includes(lowerQuery)
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
            <Box sx={{ mt: 6, display: 'flex', justifyContent: 'center' }}>
                <CircularProgress size={48} />
            </Box>
        );
    }

    if (error) {
        return (
            <Box sx={{ mt: 6, textAlign: 'center' }}>
                <Typography color="error" variant="h6">
                    {error}
                </Typography>
                <Button variant="contained" onClick={() => navigate('/locations')}>
                    Back to Locations
                </Button>
            </Box>
        );
    }

    if (!location) return null;

    const coordinates = location?.location?.coordinates;
    const lat = coordinates?.[1];
    const lng = coordinates?.[0];

    const handleDelete = () => async () => {
        if (window.confirm('Are you sure you want to delete this location?')) {
            try {
                await axios.delete(`${URL}/locations/${id}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                navigate('/locations');
            } catch {
                setError('Failed to delete location.');
            }
        }
    };

    return (
        <Box
            sx={{
                width: '100%',
                height: '100vh',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
            }}
        >
            <Box sx={{ flex: 1, overflow: 'hidden', px: 2, py: 2, minHeight: 0 }}>
                <Paper
                    elevation={4}
                    sx={{
                        p: 4,
                        borderRadius: 4,
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        minHeight: 0,
                    }}
                >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                        <Typography variant="h4" fontWeight="bold">
                            Location Details
                        </Typography>
                        <ButtonGroup variant="outlined">
                            <Button onClick={() => navigate('/locations')}>Back</Button>
                            <Button onClick={() => navigate(`/locations/${id}/update`)}>Edit</Button>
                            <Button color="error" onClick={handleDelete()}>
                                Delete
                            </Button>
                        </ButtonGroup>
                    </Box>

                    <Divider sx={{ mb: 3 }} />

                    <Grid
                        container
                        spacing={4}
                        sx={{ flex: 1, minHeight: 0, overflow: 'hidden' }}
                    >
                        <Grid
                            item
                            size={7}
                            sx={{
                                display: 'flex',
                                flexDirection: 'column',
                                minHeight: 0,
                                height: '100%',
                            }}
                        >
                            <Grid container spacing={2} sx={{ flexShrink: 0 }}>
                                <Grid item size={4}>
                                    <Detail label="Name" value={location.name} isEmphasized />
                                </Grid>
                                <Grid item size={4}>
                                    <Detail label="Identifier" value={location.identifier || 'N/A'} />
                                </Grid>
                                <Grid item size={4}>
                                    <Detail label="Description" value={location.description || 'N/A'} />
                                </Grid>
                                <Grid item size={4}>
                                    <Detail label="Address" value={location.address || 'N/A'} />
                                </Grid>
                                <Grid item size={4}>
                                    <Detail label="Total Spent" value={`€${location.total_spent?.toFixed(2) || '0.00'}`} />
                                </Grid>
                                <Grid item size={4}>
                                    <Detail label="Total Received" value={`€${location.total_received?.toFixed(2) || '0.00'}`} />
                                </Grid>
                            </Grid>

                            <Typography variant="h5" fontWeight="bold" gutterBottom sx={{ mt: 3, flexShrink: 0 }}>
                                Transactions ({filteredAndSortedTransactions.length})
                            </Typography>

                            <Box
                                sx={{
                                    display: 'flex',
                                    gap: 2,
                                    flexWrap: 'wrap',
                                    mb: 2,
                                    alignItems: 'center',
                                    flexShrink: 0,
                                }}
                            >
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
                                        setSortByChange((prev) => (prev === 'asc' ? 'desc' : prev === 'desc' ? null : 'asc'))
                                    }
                                >
                                    Sort by Amount {sortByChange === 'asc' ? '↑' : sortByChange === 'desc' ? '↓' : ''}
                                </Button>

                                <Button
                                    variant="outlined"
                                    size="medium"
                                    sx={{ width: '160px' }}
                                    onClick={() =>
                                        setSortByDate((prev) => (prev === 'asc' ? 'desc' : prev === 'desc' ? null : 'asc'))
                                    }
                                >
                                    Sort by Date {sortByDate === 'asc' ? '↑' : sortByDate === 'desc' ? '↓' : ''}
                                </Button>
                            </Box>

                            <Box
                                sx={{
                                    flex: 1,
                                    overflowY: 'auto',
                                    minHeight: 0,
                                }}
                            >
                                {filteredAndSortedTransactions.length === 0 ? (
                                    <Typography>No transactions found.</Typography>
                                ) : (
                                    <List disablePadding>
                                        {filteredAndSortedTransactions.map((tx) => (
                                            <TransactionListItem key={tx._id} transaction={tx} />
                                        ))}
                                    </List>
                                )}
                            </Box>
                        </Grid>

                        <Grid
                            item
                            size={5}
                            sx={{
                                display: 'flex',
                                flexDirection: 'column',
                                minHeight: 0,
                                height: '100%',
                            }}
                        >
                            {isLoaded && lat && lng ? (
                                <Box
                                    sx={{
                                        height: '100%',
                                        borderRadius: 2,
                                        overflow: 'hidden',
                                        mb: 2,
                                        display: 'flex',
                                        flexDirection: 'column',
                                    }}
                                >
                                    <Box sx={{ flex: '1 1 auto', borderRadius: 2, overflow: 'hidden' }}>
                                        <GoogleMap mapContainerStyle={mapContainerStyle} center={{ lat, lng }} zoom={15}>
                                            <Marker position={{ lat, lng }} />
                                        </GoogleMap>
                                    </Box>
                                    <Typography sx={{ mt: 1 }}>
                                        <strong>Address:</strong> {location.address}
                                    </Typography>
                                </Box>
                            ) : (
                                <Typography variant="body1" color="text.secondary">
                                    Map could not be loaded or location missing.
                                </Typography>
                            )}
                        </Grid>
                    </Grid>
                </Paper>
            </Box>
        </Box>
    );
};

const Detail = ({ label, value, isEmphasized = false }) => (
    <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            {label}
        </Typography>
        <Typography variant={isEmphasized ? 'h6' : 'body1'}>{value}</Typography>
    </Box>
);

export default LocationShow;
