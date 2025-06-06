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
    HeatmapLayer
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

    const [showHeatmap, setShowHeatmap] = useState(false);
    const heatmapLayerRef = useRef(null);
    const [selectedMonth, setSelectedMonth] = useState(null);
    const [selectedYear, setSelectedYear] = useState(null);

    const { isLoaded } = useJsApiLoader({
        googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
    });

    // Tema za heatmap
    const solidBackgroundStyle = [
        {
            featureType: 'landscape',
            elementType: 'geometry',
            stylers: [{ color: 'green' }]
        },
        {
            featureType: 'water',
            elementType: 'geometry',
            stylers: [{ color: '#d1e0e0' }]
        },
        {
            featureType: 'road',
            elementType: 'geometry',
            stylers: [{ color: '#ffffff' }]
        },
        {
            featureType: 'poi',
            elementType: 'geometry',
            stylers: [{ color: '#e6e6e6' }]
        },
        {
            featureType: 'transit',
            elementType: 'geometry',
            stylers: [{ color: '#dddddd' }]
        }
    ];

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

    const heatmapData = displayLocations
        .filter(loc => loc.location && Array.isArray(loc.transactions))
        .map(loc => {
            const filteredTransactions = loc.transactions.filter(tx => {
                const txDate = new Date(tx.datetime);
                const matchesMonth = !selectedMonth || (txDate.getMonth() + 1 === selectedMonth);
                const matchesYear = !selectedYear || (txDate.getFullYear() === selectedYear);
                return matchesMonth && matchesYear;
            });

            const weight = filteredTransactions.reduce((sum, tx) => sum + (tx.change || 0), 0);

            return {
                location: new window.google.maps.LatLng(
                    loc.location.coordinates[1],
                    loc.location.coordinates[0]
                ),
                weight,
            };
        })
        .filter(item => item.weight > 0);

    useEffect(() => {
        if (!isLoaded || !mapRef.current) return;

        if (showHeatmap) {
            heatmapLayerRef.current = new window.google.maps.visualization.HeatmapLayer({
                data: heatmapData,
                map: mapRef.current,
                radius: 50,
                opacity: 0.6,
            });
        } else {
            // Remove heatmap layer from map
            if (heatmapLayerRef.current) {
                heatmapLayerRef.current.setMap(null);
                heatmapLayerRef.current = null;
            }
        }

        // Cleanup on unmount
        return () => {
            if (heatmapLayerRef.current) {
                heatmapLayerRef.current.setMap(null);
                heatmapLayerRef.current = null;
            }
        };
    }, [showHeatmap, heatmapData, isLoaded]);

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
        <Box sx={{
            width: '100%',
            height: '100vh',
            px: 2,
            py: 2,
            overflow: 'hidden',
        }}>
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: isSmallScreen ? 'column' : 'row',
                    gap: 2,
                    height: '100%',
                }}
            >
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
                        <Box
                            sx={{
                                position: 'relative',
                                width: '100%',
                                height: '100%',
                            }}
                        >
                            <GoogleMap
                                mapContainerStyle={mapContainerStyle}
                                center={defaultCenter}
                                zoom={10}
                                onClick={handleMapClick}
                                onLoad={(map) => (mapRef.current = map)}
                                options={{ styles: solidBackgroundStyle }}
                                position="relative"
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

                                {nearbyMode && nearbyPoint && (
                                    <Marker
                                        position={nearbyPoint}
                                        icon={{
                                            url: 'http://maps.google.com/mapfiles/ms/icons/green-dot.png',
                                            scaledSize: new window.google.maps.Size(40, 40),
                                        }}
                                    />
                                )}

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
                                                onClick={() => navigate(`/locations/${selectedMarker._id}`)}
                                                sx={{ mt: 1 }}
                                            >
                                                View
                                            </Button>
                                        </Box>
                                    </InfoWindow>
                                )}
                            </GoogleMap>

                            {showHeatmap && (
                                <Box
                                    sx={{
                                        position: 'absolute',
                                        top: 60,
                                        left: 10,
                                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                        padding: 2,
                                        borderRadius: 2,
                                        boxShadow: 3,
                                        zIndex: 10,
                                        width: 300,
                                    }}
                                >
                                    <Typography variant="body2" fontWeight="bold">
                                        {selectedMonth
                                            ? `Month: ${new Date(0, selectedMonth - 1).toLocaleString('default', {
                                                month: 'long',
                                            })}`
                                            : 'All months'}
                                    </Typography>
                                    <Slider
                                        value={selectedMonth || 0}
                                        min={0}
                                        max={12}
                                        step={1}
                                        marks={[
                                            { value: 0 },
                                            { value: 1 },
                                            { value: 2 },
                                            { value: 3 },
                                            { value: 4 },
                                            { value: 5 },
                                            { value: 6 },
                                            { value: 7 },
                                            { value: 8 },
                                            { value: 9 },
                                            { value: 10 },
                                            { value: 11 },
                                            { value: 12 },
                                        ]}
                                        valueLabelDisplay={'off'}
                                        onChange={(_, val) => setSelectedMonth(val === 0 ? null : val)}
                                    />

                                    <Typography variant="body2" fontWeight="bold" sx={{ mt: 1 }}>
                                        {selectedYear ? `Year: ${selectedYear}` : 'All years'}
                                    </Typography>
                                    <Slider
                                        value={selectedYear || 0}
                                        min={1999}
                                        max={new Date().getFullYear()}
                                        step={1}
                                        marks={[
                                            { value: 1999 },
                                            ...Array.from(
                                                { length: new Date().getFullYear() - 1999 },
                                                (_, i) => {
                                                    const year = 2000 + i;
                                                    return { value: year };
                                                }
                                            ),
                                        ]}
                                        onChange={(_, val) => setSelectedYear(val === 1999 ? null : val)}
                                        valueLabelDisplay={'off'}
                                    />
                                </Box>
                            )}
                        </Box>
                    )}
                </Box>

                <Box
                    sx={{
                        flex: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        overflow: 'hidden',
                    }}
                >
                    <Box
                        sx={{
                            flex: 1,
                            p: 3,
                            backgroundColor: 'background.paper',
                            borderRadius: 2,
                            boxShadow: 3,
                            display: 'flex',
                            flexDirection: 'column',
                            overflow: 'hidden',
                        }}
                    >
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                            <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                                Your Locations
                            </Typography>

                            <Button
                                variant="contained"
                                onClick={() => navigate('/locations/create')}
                                disabled={polygonMode || nearbyMode}
                            >
                                Create Location
                            </Button>
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

                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
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
                            <Button
                                variant={showHeatmap ? 'contained' : 'outlined'}
                                onClick={() => setShowHeatmap((prev) => !prev)}
                            >
                                {showHeatmap ? 'Hide Heatmap' : 'Show Heatmap'}
                            </Button>
                        </Box>

                        {(polygonMode || nearbyMode) && searchError && (
                            <Typography color="error" sx={{ mb: 1 }}>
                                {searchError}
                            </Typography>
                        )}

                        {polygonMode && (
                            <Typography sx={{ mb: 1 }}>
                                Click on the map to select four points. The area inside the polygon will be used for the search.
                            </Typography>
                        )}

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

                        <Box sx={{ flex: 1, overflowY: 'auto' }}>
                            {polygonMode && polygonSearched && polygonResults.length === 0 ? (
                                <>
                                    <Typography>No locations found in polygon.</Typography>
                                    <Paper elevation={2}>
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
                                    <Paper elevation={2}>
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
                                    <Paper elevation={2}>
                                        <List>
                                            <ListItem>
                                                <ListItemText primary="None" />
                                            </ListItem>
                                        </List>
                                    </Paper>
                                </>
                            ) : (
                                <Fade in={true}>
                                    <Paper elevation={2}>
                                        <List>
                                            {displayLocations.map((location) => (
                                                <ListItem
                                                    key={location._id}
                                                    divider
                                                    button
                                                    onClick={() => navigate(`/locations/${location._id}`)}
                                                    onMouseEnter={() => setSelectedMarker(location)}
                                                    onMouseLeave={() => setSelectedMarker(null)}
                                                    sx={{
                                                        transition: 'background-color 0.3s',
                                                        '&:hover': { backgroundColor: '#f5f5f5' },
                                                    }}
                                                >
                                                    <ListItemText
                                                        primary={location.name || 'Unnamed location'}
                                                        secondary={location.address || 'No address available'}
                                                    />
                                                </ListItem>
                                            ))}
                                        </List>
                                    </Paper>
                                </Fade>
                            )}
                        </Box>
                    </Box>
                </Box>
            </Box>
        </Box>
    );
};

export default LocationList;