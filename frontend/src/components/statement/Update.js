import React, { useEffect, useState } from 'react';
import {
    Box,
    Typography,
    TextField,
    Button,
    Paper,
    CircularProgress,
    Divider,
    List,
    ListItem,
    IconButton,
    ListItemText,
    MenuItem,
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import DeleteIcon from '@mui/icons-material/Delete';
import TransactionListItem from "../transaction/ListItem";

const URL = process.env.REACT_APP_BACKEND_URL;

const StatementUpdate = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const token = localStorage.getItem('token');

    const [statement, setStatement] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [removedTxIds, setRemovedTxIds] = useState([]);
    const [allTransactions, setAllTransactions] = useState([]);


    useEffect(() => {
        const fetchStatement = async () => {
            try {
                const [stmtRes, txRes] = await Promise.all([
                    axios.get(`${URL}/statements/${id}`, {
                        headers: { Authorization: `Bearer ${token}` },
                    }),
                    axios.get(`${URL}/transactions`, {
                        headers: { Authorization: `Bearer ${token}` },
                    }),
                ]);

                setStatement(stmtRes.data.statement);
                setAllTransactions(txRes.data.transactions || []);
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to load data.');
            } finally {
                setLoading(false);
            }
        };

        fetchStatement();
    }, [id, token]);


    const handleRemoveTx = (txId) => {
        setRemovedTxIds([...removedTxIds, txId]);
    };


    const handleChange = (e) => {
        const { name, value } = e.target;
        setStatement({
            ...statement,
            [name]: value,
        });
    };

    const handleSubmit = async () => {
        try {
            const body = {
                startDate: statement.startDate,
                endDate: statement.endDate,
                inflow: Number(statement.inflow),
                outflow: Number(statement.outflow),
                startBalance: Number(statement.startBalance),
                endBalance: Number(statement.endBalance),
                addTransactions: statement.transactions.filter(
                    (txId) => !statement.originalTransactions?.includes(txId)
                ),
                removeTransactions: removedTxIds,
            };

            await axios.put(`${URL}/statements/${id}`, body, {
                headers: { Authorization: `Bearer ${token}` },
            });

            navigate(`/statements/${id}`);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update statement.');
        }
    };

    if (loading)
        return (
            <Box sx={{ mt: 6, display: 'flex', justifyContent: 'center' }}>
                <CircularProgress size={48} />
            </Box>
        );

    if (error)
        return (
            <Box sx={{ mt: 6, textAlign: 'center' }}>
                <Typography color="error" variant="h6" gutterBottom>
                    {error}
                </Typography>
                <Button variant="contained" onClick={() => navigate('/statements')}>
                    Back to Statements
                </Button>
            </Box>
        );

    if (!statement) return null;

    // Save original for comparison
    if (!statement.originalTransactions) {
        statement.originalTransactions = [...statement.transactions];
    }

    return (
        <Box sx={{ mt: 2, px: 2 }}>
            <Paper sx={{ p: 4, borderRadius: 3 }} elevation={4}>
                <Typography variant="h4" mb={3}>
                    Edit Statement
                </Typography>

                <TextField
                    label="Start Balance"
                    name="startBalance"
                    value={statement.startBalance}
                    onChange={handleChange}
                    type="number"
                    sx={{ mr: 2 }}
                />

                <Divider sx={{ my: 3 }} />
                <Box
                    sx={{
                        flex: 1,
                        maxHeight: '500px',
                        overflowY: 'auto',
                        pr: 2,
                        borderRight: '1px solid',
                        borderColor: 'divider',
                    }}
                >
                    <Typography variant="h6" gutterBottom>
                        Transactions
                    </Typography>
                    {statement.transactions?.length > 0 ? (
                        statement.transactions.map((tx) => (
                            <TransactionListItem key={tx._id} transaction={tx} />
                        ))
                    ) : (
                        <Typography variant="body2" color="text.secondary">
                            No transactions found.
                        </Typography>
                    )}
                </Box>






                <Box sx={{ mt: 4, display: 'flex', gap: 2 }}>
                    <Button variant="contained" onClick={handleSubmit}>
                        Save Changes
                    </Button>
                    <Button variant="outlined" onClick={() => navigate(`/statements/${id}`)}>
                        Cancel
                    </Button>
                </Box>
            </Paper>
        </Box>
    );
};

export default StatementUpdate;
