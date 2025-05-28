import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { AppProvider } from '@toolpad/core/AppProvider';
import { DashboardLayout } from '@toolpad/core/DashboardLayout';
import HomeIcon from '@mui/icons-material/Home';
import PersonIcon from '@mui/icons-material/Person';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';

import { useAuth } from './context/AuthContext';

import Home from './components/Home';
import Profile from './components/user/Profile';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import AccountList from './components/account/List';
import AccountCreate from './components/account/Create';
import AccountShow from './components/account/Show';
import StatementCreate from './components/statement/Create';
import AccountUpdate from "./components/account/Update";

function App() {
    const { user, loading, login, logout } = useAuth();
    const location = useLocation();

    if (loading) return null;

    // TODO: Make a default img
    const session = user
        ? {
            user: {
                name: user.username,
                email: user.email,
                image: user.image || 'https://via.placeholder.com/150',
            },
        } : null;

    const authentication = {
        signIn: login,
        signOut: logout,
    };

    // TODO: Fix the fact that only Home is always highlighted
    const navigation = [
        { kind: 'header', title: 'Main' },
        { segment: '', title: 'Home', icon: <HomeIcon /> },

        ...(user
            ? [
                { kind: 'header', title: 'User' },
                { segment: 'profile', title: 'Profile', icon: <PersonIcon />},

                { kind: 'header', title: 'Accounts' },
                { segment: 'accounts', title: 'My Accounts', icon: <AccountBalanceWalletIcon />},

            ] : []
        ),
    ];

    // TODO: Make sure that the navbar stays either extender or in short version after navigation
    return (
        <AppProvider
            session={session}
            authentication={authentication}
            navigation={navigation}
        >
            <DashboardLayout branding={{ title: 'Kaput', homeUrl: '/' }}>
                <Routes location={location}>
                    <Route path="/" element={<Home />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/accounts" element={<AccountList />} />
                    <Route path="/accounts/create" element={<AccountCreate />} />
                    <Route path="/accounts/:id" element={<AccountShow />} />
                    <Route path="/accounts/:id/statements/create" element={<StatementCreate />} />
                    <Route path="/accounts/:id/update" element={<AccountUpdate />} />
                </Routes>
            </DashboardLayout>
        </AppProvider>
    );
}

export default App;