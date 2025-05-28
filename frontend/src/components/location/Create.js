import React, { useState, useRef } from 'react';
import {
    Box,
    Button,
    TextField,
    Typography,
    Paper
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

import {
    GoogleMap,
    LoadScript,
    Marker,
    Autocomplete
} from '@react-google-maps/api';

const URL = process.env.REACT_APP_BACKEND_URL;
const GOOGLE_MAPS_API_KEY = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;

const defaultCenter = { lat: 46.5547, lng: 15.6459 };

const mapContainerStyle = {
    height: '300px',
    width: '100%',
};

const LocationCreate = () => {
    const navigate = useNavigate();
    const token = localStorage.getItem('token');

    const [form, setForm] = useState({
        name: '',
        identifier: '',
        description: '',
        address: '',
        lat: null,
        lng: null,
        icon: '',
    });

    const [marker, setMarker] = useState(null);
    const autocompleteRef = useRef(null);
    const mapRef = useRef(null);

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

    const handleMapClick = (e) => {
        const lat = e.latLng.lat();
        const lng = e.latLng.lng();
        setMarker({ lat, lng });
        setForm((prev) => ({ ...prev, lat, lng }));
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
            const res = await axios.post(`${URL}/partners`, payload, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            navigate(`/locations/${res.data.partner._id}`);
        } catch (err) {
            console.error('Failed to create partner:', err);
        }
    };

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
                    Create a New Location
                </Typography>

                <Typography sx={{ mb: 4 }}>
                    Fill in the form and pick a location on the map.
                </Typography>

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

                        <LoadScript
                            googleMapsApiKey={GOOGLE_MAPS_API_KEY}
                            libraries={['places']}
                        >
                            <Box sx={{ mb: 2 }}>
                                <Autocomplete
                                    onLoad={(ref) => (autocompleteRef.current = ref)}
                                    onPlaceChanged={handlePlaceSelected}
                                >
                                    <TextField
                                        fullWidth
                                        label="Search Address"
                                        variant="outlined"
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
                        </LoadScript>

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
                            Create Partner
                        </Button>
                    </form>
                </Paper>
            </Box>
        </Box>
    );
};

export default LocationCreate;
