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

const LocationShow = () => {
    const { id } = useParams();
    const [location, setLocation] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
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

    return (
        <Box sx={{ mt: 2, px: 2 }}>
            <Paper elevation={4} sx={{ p: 4, borderRadius: 4 }}>
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

                <Grid container spacing={4}>
                    <Grid item size={7}>
                        <Grid container spacing={2}>
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
                    </Grid>

                    <Grid item size={5}>
                        {isLoaded && lat && lng ? (
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
                                <Typography><strong>Address:</strong> {location.address}</Typography>
                            </>
                        ) : (
                            <Typography variant="body1" color="text.secondary">
                                Map could not be loaded or location missing.
                            </Typography>
                        )}
                    </Grid>
                </Grid>
            </Paper>
        </Box>
    );
};

const Detail = ({ label, value, isEmphasized = false }) => (
    <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            {label}
        </Typography>
        <Typography variant={isEmphasized ? 'h6' : 'body1'}>
            {value}
        </Typography>
    </Box>
);

export default LocationShow;
