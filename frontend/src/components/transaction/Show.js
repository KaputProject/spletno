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
    Grid
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { GoogleMap, Marker, useJsApiLoader } from '@react-google-maps/api';

const URL = process.env.REACT_APP_BACKEND_URL;
const GOOGLE_MAPS_API_KEY = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;

const mapContainerStyle = {
    width: '100%',
    height: '100%',
};

const TransactionShow = () => {
    const { id } = useParams();
    const [transaction, setTransaction] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const token = localStorage.getItem('token');

    const { isLoaded } = useJsApiLoader({
        googleMapsApiKey: GOOGLE_MAPS_API_KEY,
    });

    useEffect(() => {
        const fetchTransaction = async () => {
            try {
                const res = await axios.get(`${URL}/transactions/${id}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setTransaction(res.data.transaction);
            } catch (err) {
                console.error(err);
                setError('Failed to load transaction.');
            } finally {
                setLoading(false);
            }
        };

        fetchTransaction();
    }, [id, token]);

    const handleDelete = () => async () => {
        if (window.confirm('Are you sure you want to delete this transaction?')) {
            try {
                await axios.delete(`${URL}/transactions/${id}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                navigate('/transactions');
            } catch {
                setError('Failed to delete transaction.');
            }
        }
    };

    const formatDate = (dateStr) => {
        const date = new Date(dateStr);
        const hours = date.getHours();
        const minutes = date.getMinutes();
        const seconds = date.getSeconds();

        if (hours === 0 && minutes === 0 && seconds === 0) {
            return date.toLocaleDateString();
        }

        return date.toLocaleString();
    };

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
                <Button variant="contained" onClick={() => navigate('/transactions')}>
                    Back to Transactions
                </Button>
            </Box>
        );
    }

    if (!transaction) return null;

    const location = transaction.location;
    const coordinates = location?.location?.coordinates;
    const lat = coordinates?.[1];
    const lng = coordinates?.[0];

    return (
        <Box sx={{ mt: 2, px: 2 }}>
            <Paper elevation={4} sx={{ p: 4, borderRadius: 4 }}>
                <Box
                    sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        mb: 3,
                    }}
                >
                    <Typography variant="h4" fontWeight="bold">
                        Transaction Details
                    </Typography>
                    <ButtonGroup variant="outlined">
                        <Button onClick={() => navigate('/transactions')}>Back</Button>
                        <Button onClick={() => navigate(`/transactions/${id}/update`)}>Edit</Button>
                        <Button color="error" onClick={handleDelete()}>
                            Delete
                        </Button>
                    </ButtonGroup>
                </Box>

                <Divider sx={{ mb: 3 }} />

                <Grid container spacing={4}>
                    <Grid size={7}>
                        <Grid container spacing={2}>
                            <Grid item size={4}>
                                <Detail
                                    label="Change"
                                    value={`${transaction.outgoing ? '- ' : '+ '}${transaction.change.toFixed(2)}`}
                                    color={transaction.outgoing ? 'error.main' : 'success.main'}
                                    isEmphasized
                                />
                            </Grid>
                            <Grid item size={4}>
                                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                    Account IBAN
                                </Typography>
                                {transaction.account ? (
                                    <Link
                                        component="button"
                                        variant="body1"
                                        onClick={() => navigate(`/accounts/${transaction.account._id}`)}
                                    >
                                        {transaction.account.iban}
                                    </Link>
                                ) : (
                                    <Typography variant="body1">N/A</Typography>
                                )}
                            </Grid>
                            <Grid item size={4}>
                                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                    Location
                                </Typography>
                                {location ? (
                                    <Link
                                        component="button"
                                        variant="body1"
                                        onClick={() => navigate(`/locations/${location._id}`)}
                                    >
                                        {location.name}
                                    </Link>
                                ) : (
                                    <Typography variant="body1">N/A</Typography>
                                )}
                            </Grid>
                            <Grid item size={4}>
                                <Detail label="Date" value={formatDate(transaction.datetime)} />
                            </Grid>
                            <Grid item size={4}>
                                <Detail label="Description" value={transaction.description || 'N/A'} />
                            </Grid>
                            <Grid item size={4}>
                                <Detail label="Reference" value={transaction.reference || 'N/A'} />
                            </Grid>
                        </Grid>
                    </Grid>

                    <Grid item size={5}>
                        {isLoaded && coordinates ? (
                            <>
                                <Box
                                    sx={{
                                        height: 300,
                                        borderRadius: 2,
                                        overflow: 'hidden',
                                        mb: 2,
                                    }}
                                >
                                    <GoogleMap
                                        mapContainerStyle={mapContainerStyle}
                                        center={{ lat, lng }}
                                        zoom={15}
                                    >
                                        <Marker position={{ lat, lng }} />
                                    </GoogleMap>
                                </Box>
                                <Typography>
                                    <strong>Address:</strong> {transaction?.location?.address ?? 'N/A'}
                                </Typography>
                            </>
                        ) : (
                            <>
                                <Typography variant="h6" gutterBottom>Location unknown</Typography>
                            </>
                        )}
                    </Grid>
                </Grid>
            </Paper>
        </Box>
    );
};

const Detail = ({ label, value, color, isEmphasized = false }) => (
    <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            {label}
        </Typography>
        <Typography variant={isEmphasized ? 'h6' : 'body1'} sx={color ? { color } : {}}>
            {value}
        </Typography>
    </Box>
);

export default TransactionShow;
