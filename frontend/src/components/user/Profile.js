import React, { useEffect } from 'react';
import { Typography, Box, Button } from '@mui/material';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
    const { user, logout, loading } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!loading && !user) {
            navigate('/login');
        }
    }, [user, loading, navigate]);

    if (loading || !user) return null;

    return (
        <Box
            sx={{
                width: '100%',
                mt: 2,
                px: 2,
            }}
        >
            <Box
                sx={{
                    textAlign: 'center',
                    p: 4,
                    borderRadius: 4,
                    backgroundColor: 'primary',
                    boxShadow: 3,
                }}
            >
                <Typography variant="h3" gutterBottom sx={{ fontWeight: 'bold' }}>
                    Profile
                </Typography>

                <Typography variant="h6" sx={{ mt: 2, mb: 4 }}>
                    Welcome, {user.name}!
                </Typography>

                <Button
                    variant="contained"
                    color="error"
                    size="large"
                    onClick={() => {
                        logout();
                        navigate('/login');
                    }}
                >
                    Logout
                </Button>
            </Box>
        </Box>
    );
};

export default Profile;
