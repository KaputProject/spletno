import React, { useEffect, useState } from 'react';
import {Box, Typography, Button, Paper, CircularProgress, ButtonGroup} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { GoogleMap, Marker, useJsApiLoader } from '@react-google-maps/api';

const URL = process.env.REACT_APP_BACKEND_URL;
const GOOGLE_MAPS_API_KEY = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;

const mapContainerStyle = {
    width: '100%',
    height: '300px',
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
        const fetchPartner = async () => {
            try {
                const res = await axios.get(`${URL}/partners/${id}`, {
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

        fetchPartner();
    }, [id, token]);

    const handleDelete = () => async () => {
        if (window.confirm('Are you sure you want to delete this location?')) {
            try {
                await axios.delete(`${URL}/partners/${id}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                navigate('/locations');
            } catch (err) {
                setError('Failed to delete location.');
            }
        }
    }

    if (loading) {
        return (
            <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Box sx={{ mt: 4, textAlign: 'center' }}>
                <Typography color="error" variant="h6">{error}</Typography>
                <Button sx={{ mt: 2 }} onClick={() => navigate('/locations')} variant="contained">
                    Back to Partners
                </Button>
            </Box>
        );
    }

    if (!location) return null;

    const coordinates = location.location?.coordinates || [0, 0];
    const position = { lat: coordinates[1], lng: coordinates[0] };

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
                        {location.name}
                    </Typography>
                    <ButtonGroup variant="outlined" aria-label="Location button group">
                        <Button onClick={() => navigate('/locations')}>
                            Back
                        </Button>
                        <Button onClick={() => navigate(`/locations/${id}/update`)}>
                            Edit Location
                        </Button>
                        <Button color="error" onClick={handleDelete()}>
                            Delete Location
                        </Button>
                    </ButtonGroup>
                </Box>

                <Typography variant="subtitle1" sx={{ mb: 1 }}>
                    <strong>Identifier:</strong> {location.identifier || 'N/A'}
                </Typography>
                <Typography variant="subtitle1" sx={{ mb: 1 }}>
                    <strong>Description:</strong> {location.description || 'N/A'}
                </Typography>
                <Typography variant="subtitle1" sx={{ mb: 1 }}>
                    <strong>Address:</strong> {location.address || 'N/A'}
                </Typography>
                <Typography variant="subtitle1" sx={{ mb: 3 }}>
                    <strong>Coordinates:</strong> {position.lat}, {position.lng}
                </Typography>

                {isLoaded && location.location?.coordinates ? (
                    <Paper elevation={2} sx={{ overflow: 'hidden', borderRadius: 2 }}>
                        <GoogleMap
                            mapContainerStyle={mapContainerStyle}
                            center={position}
                            zoom={15}
                        >
                            <Marker position={position} />
                        </GoogleMap>
                    </Paper>
                ) : (
                    <Typography variant="body2" color="text.secondary">
                        Map could not be loaded.
                    </Typography>
                )}
            </Box>
        </Box>
    );
};

export default LocationShow;
