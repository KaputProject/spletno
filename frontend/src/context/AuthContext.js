import React, { createContext, useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const AuthContext = createContext();

const URL = process.env.REACT_APP_BACKEND_URL;

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [loading, setLoading] = useState(true);

    const navigate = useNavigate();

    useEffect(() => {
        // Function to load user data from local storage if a token exists
        const loadUserFromToken = async () => {
            if (token) {
                try {
                    const res = await axios.get(`${URL}/users/validate`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });

                    if(res.status === 200) {
                        setUser(res.data.user);
                    } else {
                        setUser(null);
                        setToken(null);
                        localStorage.removeItem('token');
                    }

                } catch (error) {
                    setUser(null);
                    setToken(null);
                    localStorage.removeItem('token');
                } finally {
                    setLoading(false);
                }
            } else {
                setLoading(false);
            }
        };

        loadUserFromToken();
    }, [token]);

    const login = async (username, password) => {
        try {
            const response = await axios.post(`${URL}/users/login`, { username, password });
            const newToken = response.data.token;

            localStorage.setItem('token', newToken);
            setToken(newToken);
            setUser(response.data.user);

            navigate('/');

            return { success: true };
        } catch (error) {
            console.error("Login failed:", error);

            localStorage.removeItem('token');
            setToken(null);
            setUser(null);

            let message = 'Login failed.';

            if (error.response && error.response.data && error.response.data.message) {
                message = error.response.data.message;
            } else if (error.message) {
                message = error.message;
            }

            return { success: false, message };
        }
    };


    const register = async ({ username, email, password, name, surname, dateOfBirth }) => {
        try {
            const response = await axios.post(`${URL}/users`, {
                username,
                email,
                password,
                name,
                surname,
                dateOfBirth
            });

            const newToken = response.data.token;

            localStorage.setItem('token', newToken);
            setToken(newToken);
            setUser(response.data.user);
            navigate('/profile');

            return { success: true };
        } catch (error) {
            console.error("Registration failed:", error);

            localStorage.removeItem('token');
            setToken(null);
            setUser(null);

            let message = 'Registration failed.';

            if (error.response && error.response.data && error.response.data.message) {
                message = error.response.data.message;
            } else if (error.message) {
                message = error.message;
            }

            // Vrnemo objekt s success: false in message
            return { success: false, message };
        }
    };

    const logout = () => {
        setUser(null);
        setToken(null);
        localStorage.removeItem('token');
        navigate('/login');
    };

    const contextValue = {
        user,
        token,
        loading,
        login,
        register,
        logout,
    };

    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
