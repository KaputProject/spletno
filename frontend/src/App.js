import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { AppProvider } from '@toolpad/core/AppProvider';
import { DashboardLayout } from '@toolpad/core/DashboardLayout';
import HomeIcon from '@mui/icons-material/Home';

import PersonIcon from '@mui/icons-material/Person';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PaymentIcon from '@mui/icons-material/Payment';

import { useAuth } from './context/AuthContext';

import Home from './components/Home';
import Profile from './components/user/Profile';
import Login from './components/auth/Login';
import Register from './components/auth/Register';

import AccountList from './components/account/List';
import AccountCreate from './components/account/Create';
import AccountShow from './components/account/Show';
import AccountUpdate from "./components/account/Update";

import LocationList from './components/location/List';
import LocationCreate from './components/location/Create';
import LocationShow from './components/location/Show';
import LocationUpdate from './components/location/Update';

import StatementCreate from './components/statement/Create';

import TransactionList from './components/transaction/List';
import TransactionCreate from './components/transaction/Create';
import TransactionShow from './components/transaction/Show';

import { LoadScript } from '@react-google-maps/api';
const GOOGLE_MAPS_API_KEY = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;

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

                { kind: 'header', title: 'General' },
                { segment: 'accounts', title: 'My Accounts', icon: <AccountBalanceWalletIcon />},
                { segment: 'locations', title: 'My Locations', icon: <LocationOnIcon />},
                { segment: 'transactions', title: 'My Transactions', icon: <PaymentIcon />}

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
                <LoadScript
                    googleMapsApiKey={GOOGLE_MAPS_API_KEY}
                    libraries={['places']}
                >
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

                        <Route path="/locations" element={<LocationList />} />
                        <Route path="/locations/create" element={<LocationCreate />} />
                        <Route path="/locations/:id" element={<LocationShow />} />
                        <Route path="/locations/:id/update" element={<LocationUpdate />} />

                        <Route path="/transactions" element={<TransactionList />} />
                        <Route path="/transactions/create" element={<TransactionCreate />} />
                        <Route path="/transactions/:id" element={<TransactionShow />} />
                    </Routes>
                </LoadScript>
            </DashboardLayout>
        </AppProvider>
    );
}

export default App;