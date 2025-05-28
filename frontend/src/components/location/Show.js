import React, { useEffect, useState } from 'react';
import { Box, Typography, Button, Paper, CircularProgress } from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { GoogleMap, Marker, useJsApiLoader } from '@react-google-maps/api';

const URL = process.env.REACT_APP_BACKEND_URL;
const GOOGLE_MAPS_API_KEY = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;

const mapContainerStyle = {
    width: '100%',
    height: '300px',
};

const PartnerShow = () => {
    const { id } = useParams();
    const [partner, setPartner] = useState(null);
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
                setPartner(res.data.partner);
            } catch (err) {
                console.error(err);
                setError('Failed to load partner.');
            } finally {
                setLoading(false);
            }
        };

        fetchPartner();
    }, [id, token]);

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

    if (!partner) return null;

    const coordinates = partner.location?.coordinates || [0, 0];
    const position = { lat: coordinates[1], lng: coordinates[0] };

    return (
        <Box sx={{ width: '100%', mt: 2, px: 2 }}>
            <Box
                sx={{
                    maxWidth: 700,
                    margin: '0 auto',
                    p: 4,
                    borderRadius: 4,
                    backgroundColor: 'background.paper',
                    boxShadow: 3,
                }}
            >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                    <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                        {partner.name || 'Unnamed Partner'}
                    </Typography>
                    <Button variant="outlined" onClick={() => navigate('/locations')}>
                        Back to List
                    </Button>
                </Box>

                <Typography variant="subtitle1" sx={{ mb: 1 }}>
                    <strong>Identifier:</strong> {partner.identifier || 'N/A'}
                </Typography>
                <Typography variant="subtitle1" sx={{ mb: 1 }}>
                    <strong>Description:</strong> {partner.description || 'N/A'}
                </Typography>
                <Typography variant="subtitle1" sx={{ mb: 1 }}>
                    <strong>Address:</strong> {partner.address || 'N/A'}
                </Typography>
                <Typography variant="subtitle1" sx={{ mb: 3 }}>
                    <strong>Coordinates:</strong> {position.lat}, {position.lng}
                </Typography>

                {isLoaded && partner.location?.coordinates ? (
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

export default PartnerShow;
