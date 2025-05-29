import React, { useEffect, useState } from 'react';
import {
    Box,
    Button,
    Typography,
    Paper,
    List,
    ListItem,
    ListItemText,
    CircularProgress,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const URL = process.env.REACT_APP_BACKEND_URL;

const PartnerList = () => {
    const [locations, setLocations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const token = localStorage.getItem('token');

    useEffect(() => {
        const fetchPartners = async () => {
            try {
                const res = await axios.get(`${URL}/partners`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setLocations(res.data.partners);
            } catch (err) {
                console.error(err);
                setError('Failed to load locations.');
            } finally {
                setLoading(false);
            }
        };

        fetchPartners();
    }, [token]);

    if (loading) {
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
                        Your Locations
                    </Typography>
                    <Button variant="contained" onClick={() => navigate('/locations/create')}>
                        Create Partner
                    </Button>
                </Box>

                {locations.length === 0 ? (
                    <Typography>No partner locations found.</Typography>
                ) : (
                    <Paper elevation={2}>
                        <List>
                            {locations.map((partner) => (
                                <ListItem
                                    key={partner._id}
                                    divider
                                    button
                                    onClick={() => navigate(`/locations/${partner._id}`)}
                                >
                                    <ListItemText
                                        primary={partner.name || 'Unnamed Partner'}
                                        secondary={
                                            partner.location
                                                ? `Lat: ${partner.location.coordinates[1]}, Lng: ${partner.location.coordinates[0]}`
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

export default PartnerList;
