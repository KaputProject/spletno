import React, { useEffect, useState, useRef } from 'react';
import {
    Box,
    Button,
    Typography,
    Paper,
    List,
    ListItem,
    Slider,
    ListItemText,
    CircularProgress,
    TextField,
    useMediaQuery,
    useTheme,
    Fade,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
    GoogleMap,
    Marker,
    useJsApiLoader,
    InfoWindow,
    Polygon,
} from '@react-google-maps/api';

const URL = process.env.REACT_APP_BACKEND_URL;
const defaultCenter = { lat: 46.5547, lng: 15.6459 };
const mapContainerStyle = { width: '100%', height: '100%' };

const LocationList = () => {
    const [locations, setLocations] = useState([]);
    const [filteredLocations, setFilteredLocations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filter, setFilter] = useState('');
    const [selectedMarker, setSelectedMarker] = useState(null);
    const [searchError, setSearchError] = useState('');

    // Polygon filter state
    const [polygonPoints, setPolygonPoints] = useState([]);
    const [polygonMode, setPolygonMode] = useState(false);
    const [polygonResults, setPolygonResults] = useState([]);
    const [polygonSearched, setPolygonSearched] = useState(false);

    // Nearby search state
    const [nearbyMode, setNearbyMode] = useState(false);
    const [nearbyPoint, setNearbyPoint] = useState(null);
    const [nearbyRadius, setNearbyRadius] = useState(2000); // meters
    const [nearbyResults, setNearbyResults] = useState([]);
    const [nearbySearched, setNearbySearched] = useState(false);

    const mapRef = useRef(null);
    const navigate = useNavigate();
    const token = localStorage.getItem('token');
    const theme = useTheme();
    const isSmallScreen = useMediaQuery(theme.breakpoints.down('md'));

    const { isLoaded } = useJsApiLoader({
        googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
    });

    useEffect(() => {
        const fetchPartners = async () => {
            try {
                const res = await axios.get(`${URL}/locations`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setLocations(res.data.locations);
                setFilteredLocations(res.data.locations);
            } catch (err) {
                setError('Failed to load locations.');
            } finally {
                setLoading(false);
            }
        };
        fetchPartners();
    }, [token]);

    useEffect(() => {
        if (!filter.trim()) {
            setFilteredLocations(locations);
        } else {
            const f = filter.toLowerCase();
            setFilteredLocations(
                locations.filter((loc) =>
                    (loc.name || '').toLowerCase().includes(f)
                )
            );
        }
    }, [filter, locations]);

    // Map click handler
    const handleMapClick = (e) => {
        if (polygonMode) {
            const lat = e.latLng.lat();
            const lng = e.latLng.lng();
            if (polygonPoints.length < 4) {
                setPolygonPoints((prev) => [...prev, { lat, lng }]);
            } else {
                alert('You already have 4 points! Please reset first.');
            }
        } else if (nearbyMode && !nearbyPoint) {
            setNearbyPoint({ lat: e.latLng.lat(), lng: e.latLng.lng() });
        }
    };

    // Polygon search
    const handlePolygonSearch = async () => {
        if (polygonPoints.length !== 4) {
            setPolygonResults([]);
            setPolygonSearched(true);
            setSearchError('Please select exactly 4 points to form a valid polygon.');
            return;
        }
        setSearchError('');
        try {
            const payload = { points: polygonPoints };
            const res = await axios.post(
                `${URL}/locations/polygon`,
                payload,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setPolygonResults(Array.isArray(res.data.locations) ? res.data.locations : []);
            setPolygonSearched(true);
        } catch {
            setPolygonResults([]);
            setPolygonSearched(true);
            setSearchError('Error searching in polygon.');
        }
    };

    // Nearby search
    const handleNearbySearch = async () => {
        if (!nearbyPoint) {
            setSearchError('Please select a point on the map.');
            return;
        }
        setSearchError('');
        try {
            const res = await axios.get(
                `${URL}/locations/nearby?lat=${nearbyPoint.lat}&lng=${nearbyPoint.lng}&radius=${nearbyRadius}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setNearbyResults(Array.isArray(res.data.locations) ? res.data.locations : []);
            setNearbySearched(true);
        } catch (err) {
            setNearbyResults([]);
            setNearbySearched(true);
            setSearchError('Error searching nearby locations.');
        }
    };

    // Reset polygon filter
    const handlePolygonReset = () => {
        setPolygonPoints([]);
        setPolygonResults([]);
        setPolygonSearched(false);
        setPolygonMode(false);
    };

    // Reset nearby search
    const handleNearbyReset = () => {
        setNearbyPoint(null);
        setNearbyResults([]);
        setNearbySearched(false);
        setNearbyMode(false);
        setNearbyRadius(2000);
    };

    // Determine which locations to display
    let displayLocations = filteredLocations;
    if (polygonMode && polygonResults.length > 0) displayLocations = polygonResults;
    if (nearbyMode && nearbyResults.length > 0) displayLocations = nearbyResults;

    if (loading || !isLoaded) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Typography color="error" sx={{ mt: 4, textAlign: 'center' }}>
                {error}
            </Typography>
        );
    }

    return (
        <Box sx={{ width: '100%', mt: 2, px: 2 }}>
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: isSmallScreen ? 'column' : 'row',
                    gap: 2,
                    height: isSmallScreen ? 'auto' : '600px',
                }}
            >
                {/* LEFT: MAP */}
                <Box
                    sx={{
                        flex: 1,
                        minHeight: isSmallScreen ? '300px' : '100%',
                        borderRadius: 2,
                        overflow: 'hidden',
                        boxShadow: 3,
                    }}
                >
                    {isLoaded && (
                        <GoogleMap
                            mapContainerStyle={mapContainerStyle}
                            center={defaultCenter}
                            zoom={10}
                            onClick={handleMapClick}
                            onLoad={(map) => (mapRef.current = map)}
                        >
                            {/* Draw polygon if points exist */}
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

                            {/* Marker for selected nearby point */}
                            {nearbyMode && nearbyPoint && (
                                <Marker
                                    position={nearbyPoint}
                                    icon={{
                                        url: 'http://maps.google.com/mapfiles/ms/icons/green-dot.png',
                                        scaledSize: new window.google.maps.Size(40, 40),
                                    }}
                                />
                            )}

                            {/* Markers for displayed locations */}
                            {displayLocations.map((loc) =>
                                loc.location ? (
                                    <Marker
                                        key={loc._id}
                                        position={{
                                            lat: loc.location.coordinates[1],
                                            lng: loc.location.coordinates[0],
                                        }}
                                        onClick={() => setSelectedMarker(loc)}
                                    />
                                ) : null
                            )}

                            {selectedMarker && (
                                <InfoWindow
                                    position={{
                                        lat: selectedMarker.location.coordinates[1],
                                        lng: selectedMarker.location.coordinates[0],
                                    }}
                                    onCloseClick={() => setSelectedMarker(null)}
                                >
                                    <Box sx={{ p: 1 }}>
                                        <Typography variant="subtitle1" fontWeight="bold">
                                            {selectedMarker.name || 'Unnamed Location'}
                                        </Typography>
                                        <Typography variant="body2">
                                            {selectedMarker.address || 'No address available'}
                                        </Typography>
                                        <Button
                                            size="small"
                                            onClick={() =>
                                                navigate(`/locations/${selectedMarker._id}`)
                                            }
                                            sx={{ mt: 1 }}
                                        >
                                            View
                                        </Button>
                                    </Box>
                                </InfoWindow>
                            )}
                        </GoogleMap>
                    )}
                </Box>

                {/* RIGHT: LIST + BUTTONS */}
                <Box
                    sx={{
                        flex: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        maxHeight: '100%',
                    }}
                >
                    <Box
                        sx={{
                            p: 3,
                            backgroundColor: 'background.paper',
                            borderRadius: 2,
                            boxShadow: 3,
                        }}
                    >
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                            <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                                Your Locations
                            </Typography>
                        </Box>

                        <TextField
                            fullWidth
                            variant="outlined"
                            placeholder="Search by name..."
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                            sx={{ mb: 2 }}
                            disabled={polygonMode || nearbyMode}
                        />

                        {/* Filter controls */}
                        <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                            <Button
                                variant={polygonMode ? 'contained' : 'outlined'}
                                onClick={() => {
                                    setPolygonMode((prev) => !prev);
                                    setPolygonPoints([]);
                                    setPolygonResults([]);
                                    setPolygonSearched(false);
                                    setNearbyMode(false);
                                    handleNearbyReset();
                                    setSearchError('');
                                }}
                            >
                                {polygonMode ? 'Cancel Polygon' : 'Polygon Filter'}
                            </Button>
                            <Button
                                variant="contained"
                                onClick={handlePolygonSearch}
                                disabled={!polygonMode || polygonPoints.length !== 4}
                            >
                                Search in Polygon
                            </Button>
                            <Button
                                variant={nearbyMode ? 'contained' : 'outlined'}
                                onClick={() => {
                                    if (nearbyMode) {
                                        handleNearbyReset();
                                    } else {
                                        setNearbyMode(true);
                                        setPolygonMode(false);
                                        setPolygonPoints([]);
                                        setPolygonResults([]);
                                        setPolygonSearched(false);
                                        setNearbySearched(false);
                                        setSearchError('');
                                    }
                                }}
                            >
                                {nearbyMode ? 'Cancel Nearby' : 'Nearby Search'}
                            </Button>
                            {nearbyMode && (
                                <Button
                                    variant="contained"
                                    onClick={handleNearbySearch}
                                    disabled={!nearbyPoint}
                                >
                                    Search Nearby
                                </Button>
                            )}
                        </Box>

                        {/* Error message for both search methods */}
                        {(polygonMode || nearbyMode) && searchError && (
                            <Typography color="error" sx={{ mb: 1 }}>
                                {searchError}
                            </Typography>
                        )}

                        {/* Polygon search instruction */}
                        {polygonMode && (
                            <Typography sx={{ mb: 1 }}>
                                Click on the map to select four points. The area inside the polygon will be used for the search.
                            </Typography>
                        )}

                        {/* Nearby search controls and instruction */}
                        {nearbyMode && (
                            <Box sx={{ mb: 2 }}>
                                <Typography>
                                    {nearbyPoint
                                        ? 'Adjust the radius and click "Search Nearby".'
                                        : 'Click on the map to select a center point.'}
                                </Typography>
                                {nearbyPoint && (
                                    <>
                                        <Slider
                                            value={nearbyRadius}
                                            min={500}
                                            max={10000}
                                            step={100}
                                            valueLabelDisplay="auto"
                                            onChange={(_, val) => setNearbyRadius(val)}
                                            sx={{ width: 200, mt: 1 }}
                                        />
                                        <Typography>Radius: {nearbyRadius} meters</Typography>
                                    </>
                                )}
                            </Box>
                        )}

                        {/* Results */}
                        {polygonMode && polygonSearched && polygonResults.length === 0 ? (
                            <>
                                <Typography>No locations found in polygon.</Typography>
                                <Paper elevation={2} sx={{ maxHeight: 400, overflowY: 'auto' }}>
                                    <List>
                                        <ListItem>
                                            <ListItemText primary="None" />
                                        </ListItem>
                                    </List>
                                </Paper>
                            </>
                        ) : nearbyMode && nearbySearched && nearbyResults.length === 0 ? (
                            <>
                                <Typography>No locations found nearby.</Typography>
                                <Paper elevation={2} sx={{ maxHeight: 400, overflowY: 'auto' }}>
                                    <List>
                                        <ListItem>
                                            <ListItemText primary="None" />
                                        </ListItem>
                                    </List>
                                </Paper>
                            </>
                        ) : displayLocations.length === 0 ? (
                            <>
                                <Typography>No locations match the filter.</Typography>
                                <Paper elevation={2} sx={{ maxHeight: 400, overflowY: 'auto' }}>
                                    <List>
                                        <ListItem>
                                            <ListItemText primary="None" />
                                        </ListItem>
                                    </List>
                                </Paper>
                            </>
                        ) : (
                            <Fade in={true}>
                                <Paper elevation={2} sx={{ maxHeight: 400, overflowY: 'auto' }}>
                                    <List>
                                        {displayLocations.map((location) => (
                                            <ListItem
                                                key={location._id}
                                                divider
                                                button
                                                onClick={() => navigate(`/locations/${location._id}`)}
                                                onMouseEnter={() => setSelectedMarker(location)}
                                                onMouseLeave={() => setSelectedMarker(null)}
                                                sx={{ transition: 'background-color 0.3s', '&:hover': { backgroundColor: '#f5f5f5' } }}
                                            >
                                                <ListItemText
                                                    primary={location.name || 'Unnamed location'}
                                                    secondary={
                                                        location.address || 'No address available'
                                                    }
                                                />
                                            </ListItem>
                                        ))}
                                    </List>
                                </Paper>
                            </Fade>
                        )}

                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                            <Button
                                variant="contained"
                                onClick={() => navigate('/locations/create')}
                                sx={{ mr: 1 }}
                                disabled={polygonMode || nearbyMode}
                            >
                                Create Location
                            </Button>
                        </Box>
                    </Box>
                </Box>
            </Box>
        </Box>
    );
};

export default LocationList;