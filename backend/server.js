const express = require('express');
const cors = require('cors');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const mongoose = require('mongoose');
const dotenv = require('dotenv').config();
const jwt = require("jsonwebtoken");
const morgan = require('morgan');

const app = express();
const PORT = process.env.PORT || 5000;

// Here you should require your routes
const userRouter = require('./routes/userRoutes');
const accountRouter = require('./routes/accountRoutes');
const statementRouter = require('./routes/statementRoutes');
const transactionRouter = require('./routes/transactionRoutes');
const locationRouter = require('./routes/locationRoutes');

const {join} = require("node:path");

const mongoDB = process.env.MONGO_URI;
mongoose.connect(mongoDB);
mongoose.Promise = global.Promise;
mongoose.connection.on('error', console.error.bind(console, 'MongoDB connection error:'));

app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true
}));

app.use(express.json());
app.use(morgan('dev'));

// Session Middleware
app.use(session({
    secret: 'work hard',
    resave: true,
    saveUninitialized: false,
    store: MongoStore.create({
        mongoUrl: mongoDB,
        collectionName: 'sessions'
    }),
}));

// Avatar Middleware
app.use(express.static(join(__dirname, 'public')));

// Here you can add your routes
app.use('/users', userRouter);
app.use('/accounts', accountRouter);
app.use('/statements', statementRouter);
app.use('/transactions', transactionRouter);
app.use('/locations', locationRouter);

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


// Start Server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
