const express = require('express');
const cors = require('cors');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const mongoose = require('mongoose');
const dotenv = require('dotenv').config();
const jwt = require("jsonwebtoken");

const app = express();
const PORT = process.env.PORT || 5000;

// Here you should require your routes
const userRouter = require('./routes/userRoutes');
const accountRouter = require('./routes/accountRoutes');
const statementRouter = require('./routes/statementRoutes');
const transactionRouter = require('./routes/transactionRoutes');
const locationRouter = require('./routes/locationRoutes');

const mongoDB = process.env.MONGO_URI;
mongoose.connect(mongoDB);
mongoose.Promise = global.Promise;
mongoose.connection.on('error', console.error.bind(console, 'MongoDB connection error:'));

app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true
}));
app.use(express.json());

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

// Here you can add your routes
app.use('/users', userRouter);
app.use('/accounts', accountRouter);
app.use('/statements', statementRouter);
app.use('/transactions', transactionRouter);
app.use('/locations', locationRouter);

// Start Server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
