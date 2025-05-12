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

// MongoDB Connection
const mongoDB = "mongodb://127.0.0.1/kaput";
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
    store: MongoStore.create({ mongoUrl: mongoDB }),
}));

// Here you can add your routes
app.use('/users', userRouter);

// Start Server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
