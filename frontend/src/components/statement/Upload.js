// PdfUploadModal.js
import React, { useState, useRef } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography,
    CircularProgress,
    Box
} from '@mui/material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const URL = process.env.REACT_APP_BACKEND_URL;

const UploadModal = ({ open, onClose }) => {
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const inputRef = useRef();
    const navigate = useNavigate();

    const handleFileClick = (e) => {
        e.target.value = null;
    };

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!file) return alert('Please, choose a PDF of a statement you want to upload.');
        if (file.type !== 'application/pdf') return alert('Only PDF files are allowed.');
        if (file.size > 5 * 1024 * 1024) return alert('File size exceeds the maximum of 5 MB.');

        const token = localStorage.getItem('token');
        const formData = new FormData();
        formData.append('file', file);

        setUploading(true);

        try {
            const res = await axios.post(`${URL}/statements/upload`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${token}`,
                },
            });

            setFile(null);
            if (inputRef.current) inputRef.current.value = '';
            onClose();
            navigate('/transactions/parsed', {
                state: { transactions: res.data.transactions },
            });
        } catch (err) {
            console.error('Error during the upload of the file:', err);
            alert(err.response?.data?.message || 'Error when uploading the file.');
        } finally {
            setUploading(false);
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>Upload a PDF of your statement</DialogTitle>
            <form onSubmit={handleSubmit}>
                <DialogContent>
                    <Button variant="outlined" component="label" fullWidth sx={{ mb: 2 }}>
                        {file ? file.name : 'Choose a PDF'}
                        <input
                            hidden
                            type="file"
                            accept="application/pdf"
                            onClick={handleFileClick}
                            onChange={handleFileChange}
                            ref={inputRef}
                        />
                    </Button>
                </DialogContent>
                <DialogActions>
                    <Button onClick={onClose} disabled={uploading}>Cancel</Button>
                    <Button
                        variant="contained"
                        color="primary"
                        type="submit"
                        disabled={uploading}
                        startIcon={uploading ? <CircularProgress size={20} color="inherit" /> : null}
                    >
                        {uploading ? 'Loading...' : 'Upload'}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
};

export default UploadModal;
