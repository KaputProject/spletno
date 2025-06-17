const express = require('express');
const cors = require('cors');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const mongoose = require('mongoose');
const dotenv = require('dotenv').config();
const jwt = require("jsonwebtoken");
const morgan = require('morgan');
const { join } = require("node:path");

const app = express();
const PORT = process.env.PORT || 5000;

// Load Routes
const userRouter = require('./routes/userRoutes');
const accountRouter = require('./routes/accountRoutes');
const statementRouter = require('./routes/statementRoutes');
const transactionRouter = require('./routes/transactionRoutes');
const locationRouter = require('./routes/locationRoutes');

const mongoDB = process.env.MONGO_URI;

// Mongo connect only if NOT in test environment
if (process.env.NODE_ENV !== 'test') {
    mongoose.connect(mongoDB)
        .then(() => console.log('MongoDB connected'))
        .catch(err => console.error('MongoDB connection error:', err));
}

// Middleware
app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true
}));
app.use(express.json());
app.use(morgan('dev'));

// Session only if NOT in test environment
if (process.env.NODE_ENV !== 'test') {
    app.use(session({
        secret: 'work hard',
        resave: true,
        saveUninitialized: false,
        store: MongoStore.create({
            mongoUrl: mongoDB,
            collectionName: 'sessions'
        }),
    }));
}

// Static files
app.use(express.static(join(__dirname, 'public')));

// Routes
app.use('/users', userRouter);
app.use('/accounts', accountRouter);
app.use('/statements', statementRouter);
app.use('/transactions', transactionRouter);
app.use('/locations', locationRouter);

// Error Handler
app.use((err, req, res, next) => {
    console.error('--- ERROR START ---');
    console.error(`Error Message: ${err.message}`);
    console.error(`Stack Trace:\n${err.stack}`);
    console.error('--- ERROR END ---');

    res.status(err.status || 500).json({
        message: err.message || 'Internal Server Error',
        error: process.env.NODE_ENV === 'development' ? err : {}
    });
});

// Start server only if NOT in test
if (process.env.NODE_ENV !== 'test') {
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
}

// Export app for testing
module.exports = app;
