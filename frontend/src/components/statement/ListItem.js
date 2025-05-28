import React from 'react';
import { ListItem, ListItemText, Typography, Divider } from '@mui/material';

const StatementItem = ({ statement }) => {
    return (
        <>
            <ListItem sx={{ py: 2, px: 3 }}>
                <ListItemText
                    primary={
                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                            Statement: {statement.month + 1}/{statement.year}
                        </Typography>
                    }
                    secondary={
                        <>
                            <Typography variant="body2">
                                Period: {new Date(statement.startDate).toLocaleDateString()} - {new Date(statement.endDate).toLocaleDateString()}
                            </Typography>
                        </>
                    }
                />
            </ListItem>
            <Divider />
        </>
    );
};

export default StatementItem;
