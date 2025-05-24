import React from 'react';
import { Container, Typography, Box, Button } from '@mui/material';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    if (!user) {
        return (
            <Container maxWidth="xl" sx={{ mt: 2 }}>
                <Typography variant="h5" align="center">
                    Loading...
                </Typography>
            </Container>
        );
    }

    return (
        <Container maxWidth="xl" sx={{ mt: 2 }}>
            <Box
                sx={{
                    textAlign: 'center',
                    p: 4,
                    borderRadius: 4,
                    backgroundColor: 'secondary',
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
        </Container>
    );
};

export default Profile;