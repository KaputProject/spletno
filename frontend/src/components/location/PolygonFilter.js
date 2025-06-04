import React, { useRef, useState } from 'react';
import {
    Box,
    Button,
    Typography,
    Paper,
    List,
    ListItem,
    ListItemText,
} from '@mui/material';
import { GoogleMap, Polygon } from '@react-google-maps/api';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const URL = process.env.REACT_APP_BACKEND_URL;
const defaultCenter = { lat: 46.5547, lng: 15.6459 };
const mapContainerStyle = { height: '400px', width: '100%' };

const PolygonFilter = () => {
    const [polygonPoints, setPolygonPoints] = useState([]);
    const [results, setResults] = useState([]);
    const mapRef = useRef(null);
    const navigate = useNavigate();
    const token = localStorage.getItem('token');

    const handleMapClick = (e) => {
        const lat = e.latLng.lat();
        const lng = e.latLng.lng();

        if (polygonPoints.length < 4) {
            setPolygonPoints((prev) => [...prev, { lat, lng }]);
        } else {
            alert('Že imaš 4 točke! Najprej resetiraj.');
        }
    };

    const handleSearch = async () => {
        if (polygonPoints.length !== 4) {
            alert('Prosimo, izberi natanko 4 točke.');
            return;
        }

        try {
            const payload = { points: polygonPoints };

            const res = await axios.post(
                `${URL}/locations/polygon`,
                payload,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            // backend vrne { locations: [...] }
            const foundLocations = res.data.locations;

            if (Array.isArray(foundLocations)) {
                setResults(foundLocations);
            } else {
                console.error('Napaka: backend ni vrnil array:', foundLocations);
                setResults([]);
            }
        } catch (err) {
            console.error('Error searching in polygon:', err.response?.data || err.message);
        }
    };

    const handleReset = () => {
        setPolygonPoints([]);
        setResults([]);
    };

    return (
        <Box sx={{ p: 2 }}>
            <Typography variant="h4" sx={{ mb: 2 }}>
                Polygon Filter
            </Typography>

            <GoogleMap
                mapContainerStyle={mapContainerStyle}
                center={defaultCenter}
                zoom={10}
                onClick={handleMapClick}
                onLoad={(map) => (mapRef.current = map)}
            >
                {polygonPoints.length > 0 && (
                    <Polygon
                        paths={polygonPoints}
                        options={{
                            fillColor: 'lightblue',
                            strokeColor: 'blue',
                            fillOpacity: 0.4,
                            strokeWeight: 2,
                        }}
                    />
                )}
            </GoogleMap>

            <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
                <Button variant="contained" onClick={handleSearch} disabled={polygonPoints.length !== 4}>
                    Išči v poligonu
                </Button>
                <Button variant="outlined" onClick={handleReset}>
                    Ponastavi
                </Button>
            </Box>

            <Box sx={{ mt: 4 }}>
                <Typography variant="h6">Rezultati</Typography>
                {results.length === 0 ? (
                    <Typography sx={{ mt: 1 }}>Ni najdenih lokacij.</Typography>
                ) : (
                    <Paper elevation={2} sx={{ mt: 1 }}>
                        <List>
                            {results.map((location) => (
                                <ListItem
                                    key={location._id}
                                    button
                                    divider
                                    onClick={() => navigate(`/locations/${location._id}`)}
                                >
                                    <ListItemText
                                        primary={location.name || 'Unnamed Partner'}
                                        secondary={
                                            location.location
                                                ? `Lat: ${location.location.coordinates[1]}, Lng: ${location.location.coordinates[0]}`
                                                : 'No coordinates'
                                        }
                                    />
                                </ListItem>
                            ))}
                        </List>
                    </Paper>
                )}
            </Box>
        </Box>
    );
};

export default PolygonFilter;
