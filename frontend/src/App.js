import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { AppProvider } from '@toolpad/core/AppProvider';
import { DashboardLayout } from '@toolpad/core/DashboardLayout';
import HomeIcon from '@mui/icons-material/Home';
import PersonIcon from '@mui/icons-material/Person';
import DescriptionIcon from '@mui/icons-material/Description';

import { useAuth } from './context/AuthContext';

import Home from './components/Home';
import Profile from './components/user/Profile';
import Login from './components/auth/Login';
import Register from './components/auth/Register';

function App() {
    const { user, loading } = useAuth();
    const location = useLocation();

    if (loading) return null;

    const NAVIGATION = [
        {
            segment: '',
            title: 'Home',
            icon: <HomeIcon />,
            path: '/',
        },
        ...(user
            ? [
                { kind: 'header', title: 'User' },
                { segment: 'profile', title: 'Profile', icon: <PersonIcon /> },
            ]
            : [
                { kind: 'header', title: 'Auth' },
                { segment: 'login', title: 'Login', icon: <DescriptionIcon /> },
                { segment: 'register', title: 'Register', icon: <DescriptionIcon /> },
            ]),
    ];

    return (
        <AppProvider navigation={navigation}>
            <DashboardLayout branding={{ title: 'Kaput', homeUrl: '/' }}>
                <Routes location={location}>
                    <Route path="/" element={<Home />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                </Routes>
            </DashboardLayout>
        </AppProvider>
    );
}

export default App;