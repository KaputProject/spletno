import React from 'react';
import { Typography, Box, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Home = () => {
    const navigate = useNavigate();
    const { user } = useAuth();

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
                    Welcome to MyProfileHub
                </Typography>

                <Typography sx={{ mt: 2, mb: 4 }}>
                    A simple app that helps you manage your profile, settings, and activity all in one place. Whether you're checking your account details or adjusting preferences, MyProfileHub keeps it clean and user-friendly.
                </Typography>

                {!user && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 4 }}>
                        <Button
                            variant="contained"
                            color="primary"
                            size="large"
                            onClick={() => navigate('/login')}
                        >
                            Login
                        </Button>
                        <Button
                            variant="outlined"
                            color="primary"
                            size="large"
                            onClick={() => navigate('/register')}
                        >
                            Register
                        </Button>
                    </Box>
                )}
            </Box>
        </Box>
    );
};

export default Home;