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
                    Welcome to Kaput
                </Typography>

                <Typography sx={{ mt: 2, mb: 4 }}>
                    Welcome to Kaput — the app that generously reminds you you’re terrible with money. Watch your pathetic spending habits mapped out in glorious detail, so you can admire how expertly you throw cash into the void. Bonus: Now with location tracking for all those genius purchases you barely remember making. Bravo, financial mastermind.
                </Typography>

                {!user && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 4 }}>
                        <Button
                            variant="contained"
                            color="primary"
                            size="large"
                            onClick={() => navigate('/login')}
                        >
                            Sign In
                        </Button>
                        <Button
                            variant="outlined"
                            color="primary"
                            size="large"
                            onClick={() => navigate('/register')}
                        >
                            Sign Up
                        </Button>
                    </Box>
                )}
            </Box>
        </Box>
    );
};

export default Home;