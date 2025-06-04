import React, { useState, useRef } from 'react';
import { Box, Button, Typography, Paper, CircularProgress } from '@mui/material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const URL = process.env.REACT_APP_BACKEND_URL;

const PdfUpload = () => {
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const inputRef = useRef();
    const navigate = useNavigate();

    const handleFileClick = (e) => {
        // Resetiraj input, da lahko uporabnik izbere isto datoteko večkrat zapored
        e.target.value = null;
    };

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!file) {
            alert('Prosim izberi PDF datoteko.');
            return;
        }

        if (file.type !== 'application/pdf') {
            alert('Samo PDF datoteke so dovoljene.');
            return;
        }

        // Preveri velikost datoteke (maksimalno 5MB)
        if (file.size > 5 * 1024 * 1024) {
            alert('Datoteka je prevelika (maksimalno 5MB).');
            return;
        }
        const token = localStorage.getItem('token');

        const formData = new FormData();
        formData.append('file', file);

        setUploading(true);

        try {
            const res = await axios.post(`${URL}/statements/upload`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${token}`,
                },
            });
            //console.log('Response from server:', res.data);
            alert('Datoteka je bila uspešno naložena.');
            setFile(null);

            navigate('/transactions/parsed', {
                state: { transactions: res.data.transactions },
            });

            if (inputRef.current) {
                inputRef.current.value = '';
            }
        } catch (err) {
            console.error('Napaka pri nalaganju datoteke:', err);
            alert(
                err.response?.data?.message || 'Prišlo je do napake pri nalaganju datoteke.'
            );
        } finally {
            setUploading(false);
        }
    };

    return (
        <Box sx={{ maxWidth: 400, mx: 'auto', mt: 6 }}>
            <Paper elevation={3} sx={{ p: 4 }}>
                <Typography variant="h5" align="center" gutterBottom>
                    Naloži PDF datoteko
                </Typography>
                <form onSubmit={handleSubmit}>
                    <Button
                        variant="outlined"
                        component="label"
                        fullWidth
                        sx={{ mb: 2, py: 2 }}
                        aria-label="Izberi PDF datoteko"
                    >
                        {file ? file.name : 'Izberi PDF datoteko'}
                        <input
                            hidden
                            type="file"
                            accept="application/pdf"
                            onClick={handleFileClick}
                            onChange={handleFileChange}
                            ref={inputRef}
                        />
                    </Button>

                    <Button
                        variant="contained"
                        color="primary"
                        type="submit"
                        fullWidth
                        disabled={uploading}
                        sx={{ py: 1.5 }}
                        aria-label="Naloži PDF datoteko"
                    >
                        {uploading ? (
                            <>
                                <CircularProgress size={24} color="inherit" sx={{ mr: 1 }} />
                                Nalaganje...
                            </>
                        ) : (
                            'Naloži'
                        )}
                    </Button>
                </form>
            </Paper>
        </Box>
    );
};

export default PdfUpload;
