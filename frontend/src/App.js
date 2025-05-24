import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { AppProvider } from '@toolpad/core/AppProvider';
import { DashboardLayout } from '@toolpad/core/DashboardLayout';
import HomeIcon from '@mui/icons-material/Home';
import PersonIcon from '@mui/icons-material/Person';

import { useAuth } from './context/AuthContext';

import Home from './components/Home';
import Profile from './components/user/Profile';
import Login from './components/auth/Login';
import Register from './components/auth/Register';

function App() {
    const { user } = useAuth();

    const NAVIGATION = [
        {
            segment: '',
            title: 'Home',
            icon: <HomeIcon />,
            path: '/',
        },
        ...(user
            ? [
                {
                    segment: 'profile',
                    title: 'Profile',
                    icon: <PersonIcon />,
                    path: '/profile',
                },
            ]
            : []),
    ];

    return (
        <AppProvider navigation={NAVIGATION}>
            <DashboardLayout
                branding={{
                    title: 'Kaput',
                    homeUrl: '/',
                }}
            >
                <Routes>
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