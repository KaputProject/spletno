import React from 'react';
import { useAuth } from '../../context/AuthContext';

const Profile = () => {
    const { user, logout } = useAuth();

    if (!user) {
        return <div>Loading...</div>;
    }

    return (
        <div>
            <h2>Profile</h2>
            <p>Welcome, {user.name}!</p>
            <button onClick={logout}>Logout</button>
        </div>
    );
};

export default Profile;