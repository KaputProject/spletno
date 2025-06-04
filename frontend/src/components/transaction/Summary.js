import React from 'react';
import {
    Box
} from '@mui/material';
import TransactionCard from './Card';

const TransactionSummary = ({ mostRecent, biggestPositive, biggestNegative }) => (
    <Box>
        <TransactionCard title="Most Recent" transaction={mostRecent} />
        <TransactionCard title="Biggest Positive" transaction={biggestPositive} />
        <TransactionCard title="Biggest Negative" transaction={biggestNegative} />
    </Box>
);

export default TransactionSummary;
