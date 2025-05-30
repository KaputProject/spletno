import React, { useEffect, useState } from 'react';
import {
    Typography,
    Box,
    Button,
    TextField,
    Avatar,
    Grid,
    IconButton,
    Alert,
    Collapse,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText, DialogActions
} from '@mui/material';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import PhotoCamera from '@mui/icons-material/PhotoCamera';
import axios from 'axios';

const URL = process.env.REACT_APP_BACKEND_URL;

const Profile = () => {
    const { user, logout, loading, refreshUser } = useAuth();
    const navigate = useNavigate();

    const token = localStorage.getItem('token');

    const [formData, setFormData] = useState({
        username: '',
        name: '',
        surname: '',
        email: '',
        dateOfBirth: '',
        password: '',
        confirmPassword: '',
        avatar: null,
    });

    const [alert, setAlert] = useState({ open: false, severity: 'success', message: '' });
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [preview, setPreview] = useState(null);

    useEffect(() => {
        if (!loading && !user) navigate('/login');

        if (user) {
            setFormData({
                username: user.username || '',
                name: user.name || '',
                surname: user.surname || '',
                email: user.email || '',
                dateOfBirth: user.dateOfBirth?.substring(0, 10) || '',
                password: '',
                confirmPassword: '',
                avatar: null,
            });
        }
    }, [user, loading, navigate]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData((prev) => ({ ...prev, avatar: file }));
            setPreview(URL.createObjectURL(file));
        }
    };

    const showAlert = (message, severity = 'success') => {
        setAlert({ open: true, severity, message });
        setTimeout(() => {
            setAlert((prev) => ({ ...prev, open: false }));
        }, 5000);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (formData.password && formData.password !== formData.confirmPassword) {
            showAlert("Password and Confirm Password do not match.", 'error');
            setFormData((prev) => ({ ...prev, password: '', confirmPassword: '' }));
            return;
        }

        const data = new FormData();
        Object.keys(formData).forEach((key) => {
            if (formData[key]) {
                data.append(key, formData[key]);
            }
        });

        try {
            await axios.put(
                `${URL}/users/${user._id}`,
                data,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                        'Authorization': `Bearer ${token}`,
                    },
                }
            );

            showAlert('Profile updated successfully', 'success');
            setFormData((prev) => ({ ...prev, password: '', confirmPassword: '' }));

            if (typeof refreshUser === 'function') refreshUser();
        } catch (err) {
            console.error('Axios error:', err.response?.data || err.message);
            showAlert('Error updating profile: ' + (err.response?.data?.message || 'Unknown error'), 'error');
            setFormData((prev) => ({ ...prev, password: '', confirmPassword: '' }));
        }
    };

    const handleDelete = async () => {
        try {
            await axios.delete(
                `${URL}/users/${user._id}`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                }
            );
            logout();
            navigate('/login');
        } catch (err) {
            showAlert('Error deleting profile: ' + (err.response?.data?.message || 'Unknown error'), 'error');
        }
    };

    if (loading || !user) return null;

    if (!token) {
        navigate('/login');
    }

    return (
        <Box sx={{ width: '100%', mt: 2, px: 2 }}>
            <Box
                component="form"
                onSubmit={handleSubmit}
                sx={{
                    maxWidth: 600,
                    mx: 'auto',
                    p: 4,
                    borderRadius: 4,
                    backgroundColor: 'background.paper',
                    boxShadow: 3,
                }}
            >
                <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', textAlign: 'center' }}>
                    Profile
                </Typography>

                <Grid container spacing={2} alignItems="center" justifyContent="center" sx={{ mb: 2 }}>
                    <Grid item>
                        <Avatar
                            src={preview || `${URL}${user.avatarUrl}` || '/default-avatar.png'}
                            sx={{ width: 80, height: 80 }}
                        />
                    </Grid>
                    <Grid item>
                        <label htmlFor="avatar-upload">
                            <input
                                accept="image/*"
                                style={{ display: 'none' }}
                                id="avatar-upload"
                                type="file"
                                onChange={handleFileChange}
                            />
                            <IconButton color="primary" component="span">
                                <PhotoCamera />
                            </IconButton>
                        </label>
                    </Grid>
                </Grid>

                {/* Alert pod avatarjem */}
                <Collapse in={alert.open} sx={{ mb: 2 }}>
                    <Alert severity={alert.severity} onClose={() => setAlert((prev) => ({ ...prev, open: false }))}>
                        {alert.message}
                    </Alert>
                </Collapse>

                <TextField fullWidth label="Username" name="username" value={formData.username} onChange={handleChange} sx={{ mt: 1 }} />
                <TextField fullWidth label="Name" name="name" value={formData.name} onChange={handleChange} sx={{ mt: 2 }} />
                <TextField fullWidth label="Surname" name="surname" value={formData.surname} onChange={handleChange} sx={{ mt: 2 }} />
                <TextField fullWidth label="Email" name="email" type="email" value={formData.email} onChange={handleChange} sx={{ mt: 2 }} />
                <TextField fullWidth label="Date of Birth" name="dateOfBirth" type="date" value={formData.dateOfBirth} onChange={handleChange} sx={{ mt: 2 }} InputLabelProps={{ shrink: true }} />

                <TextField fullWidth label="New Password" name="password" type="password" value={formData.password} onChange={handleChange} sx={{ mt: 2 }} />
                <TextField fullWidth label="Confirm Password" name="confirmPassword" type="password" value={formData.confirmPassword} onChange={handleChange} sx={{ mt: 2 }} />

                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
                    <Button type="submit" variant="contained" color="primary">
                        Save Changes
                    </Button>

                    <Box>
                        <Button
                            variant="outlined"
                            color="error"
                            sx={{ mr: 2 }}
                            onClick={() => setDeleteDialogOpen(true)}
                        >
                            Delete Profile
                        </Button>

                        <Button
                            variant="outlined"
                            color="secondary"
                            onClick={() => {
                                logout();
                                navigate('/login');
                            }}
                        >
                            Sign Out
                        </Button>
                    </Box>
                </Box>

                {/* Delete confirmation dialog */}
                <DeleteDialog
                    open={deleteDialogOpen}
                    onClose={() => setDeleteDialogOpen(false)}
                    onDelete={handleDelete}
                />
            </Box>
        </Box>
    );
};

// Ločena komponenta za dialog
const DeleteDialog = ({ open, onClose, onDelete }) => (
    <Dialog open={open} onClose={onClose}>
        <DialogTitle>Confirm Profile Deletion</DialogTitle>
        <DialogContent>
            <DialogContentText>
                Are you sure you want to delete your profile? This action cannot be undone.
            </DialogContentText>
        </DialogContent>
        <DialogActions>
            <Button onClick={onClose} color="primary">Cancel</Button>
            <Button onClick={onDelete} color="error" autoFocus>Delete</Button>
        </DialogActions>
    </Dialog>
);

export default Profile;
