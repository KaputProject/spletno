import React, { useState, useRef, useEffect } from 'react';
import {
    Box,
    Button,
    TextField,
    Typography,
    Paper
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';

import {
    GoogleMap,
    Marker,
    Autocomplete
} from '@react-google-maps/api';

const URL = process.env.REACT_APP_BACKEND_URL;
const defaultCenter = { lat: 46.5547, lng: 15.6459 };

const mapContainerStyle = {
    height: '300px',
    width: '100%',
};

const LocationEdit = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const token = localStorage.getItem('token');

    const [form, setForm] = useState({
        name: '',
        identifier: '',
        description: '',
        address: '',
        lat: null,
        lng: null,
    });

    const [loading, setLoading] = useState(true);
    const [marker, setMarker] = useState(null);
    const [error, setError] = useState(null);
    const autocompleteRef = useRef(null);
    const mapRef = useRef(null);

    useEffect(() => {
        const fetchLocation = async () => {
            try {
                const res = await axios.get(`${URL}/locations/${id}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                const loc = res.data.partner;
                const [lng, lat] = loc.location?.coordinates || [null, null];

                setForm({
                    name: loc.name || '',
                    identifier: loc.identifier || '',
                    description: loc.description || '',
                    address: loc.address || '',
                    lat,
                    lng,
                });

                if (lat && lng) setMarker({ lat, lng });

                setLoading(false);
            } catch (err) {
                console.error('Error loading location:', err);
                setError('Failed to load location data.');
                setLoading(false);
            }
        };

        fetchLocation();
    }, [id, token]);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handlePlaceSelected = () => {
        const place = autocompleteRef.current.getPlace();
        if (place.geometry) {
            const lat = place.geometry.location.lat();
            const lng = place.geometry.location.lng();
            const address = place.formatted_address;

            setForm((prev) => ({ ...prev, lat, lng, address }));
            setMarker({ lat, lng });

            mapRef.current?.panTo({ lat, lng });
        }
    };

    const handleMapClick = async (e) => {
        const lat = e.latLng.lat();
        const lng = e.latLng.lng();

        const geocoder = new window.google.maps.Geocoder();
        geocoder.geocode({ location: { lat, lng } }, (results, status) => {
            if (status === 'OK' && results[0]) {
                const address = results[0].formatted_address;
                setForm((prev) => ({ ...prev, lat, lng, address }));
            } else {
                setForm((prev) => ({ ...prev, lat, lng }));
            }
            setMarker({ lat, lng });
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const payload = {
            ...form,
            location: {
                type: 'Point',
                coordinates: [form.lng, form.lat],
            },
        };

        try {
            await axios.put(`${URL}/locations/${id}`, payload, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            navigate(`/locations/${id}`);
        } catch (err) {
            console.error('Failed to update location:', err);
            setError('Failed to update location.');
        }
    };

    if (loading) {
        return <Typography sx={{ mt: 4, textAlign: 'center' }}>Loading...</Typography>;
    }

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
                    textAlign: 'center',
                }}
            >
                <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 2 }}>
                    Edit Location
                </Typography>

                <Typography sx={{ mb: 4 }}>
                    Modify the location details below and save changes.
                </Typography>

                {error && (
                    <Typography color="error" sx={{ mb: 2 }}>
                        {error}
                    </Typography>
                )}

                <Paper elevation={2} sx={{ p: 3, borderRadius: 2, textAlign: 'left' }}>
                    <form onSubmit={handleSubmit}>
                        <TextField
                            fullWidth
                            label="Name"
                            name="name"
                            value={form.name}
                            onChange={handleChange}
                            sx={{ mb: 3 }}
                            required
                        />
                        <TextField
                            fullWidth
                            label="Identifier"
                            name="identifier"
                            value={form.identifier}
                            onChange={handleChange}
                            sx={{ mb: 3 }}
                            required
                        />
                        <TextField
                            fullWidth
                            multiline
                            rows={3}
                            label="Description"
                            name="description"
                            value={form.description}
                            onChange={handleChange}
                            sx={{ mb: 3 }}
                        />

                        <Box sx={{ mb: 2 }}>
                            <Autocomplete
                                onLoad={(ref) => (autocompleteRef.current = ref)}
                                onPlaceChanged={handlePlaceSelected}
                            >
                                <TextField
                                    fullWidth
                                    label="Search Address"
                                    name="address"
                                    variant="outlined"
                                    placeholder="Type an address"
                                    value={form.address}
                                    onChange={handleChange}
                                />
                            </Autocomplete>
                        </Box>

                        <GoogleMap
                            mapContainerStyle={mapContainerStyle}
                            center={marker || defaultCenter}
                            zoom={marker ? 15 : 12}
                            onClick={handleMapClick}
                            onLoad={(map) => (mapRef.current = map)}
                        >
                            {marker && <Marker position={marker} />}
                        </GoogleMap>

                        {form.lat && form.lng && (
                            <Typography variant="body2" sx={{ mt: 2 }}>
                                Selected Location: {form.lat.toFixed(6)}, {form.lng.toFixed(6)}
                            </Typography>
                        )}

                        <Button
                            type="submit"
                            variant="contained"
                            color="primary"
                            fullWidth
                            sx={{ mt: 3 }}
                        >
                            Save Changes
                        </Button>
                    </form>
                </Paper>
            </Box>
        </Box>
    );
};

export default LocationEdit;
