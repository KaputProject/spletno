const express = require('express');
const cors = require('cors');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const morgan = require('morgan');
const { join } = require("node:path");

// Naloži ustrezno .env datoteko
dotenv.config({
    path: process.env.NODE_ENV === 'test' ? '.env.test' : '.env'
});

const app = express();
const PORT = process.env.PORT || 5000;
const mongoDB = process.env.MONGO_URI;

// Poveži MongoDB (tudi v testnem okolju)
mongoose.connect(mongoDB, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
    .then(() => {
        if (process.env.NODE_ENV !== 'test') {
            console.log('MongoDB connected');
        }
    })
    .catch(err => {
        console.error('MongoDB connection error:', err);
    });

// Middleware
app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true
}));
app.use(express.json());
app.use(morgan('dev'));

// Seje (izklopljene med testiranjem)
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

// Statika (za avatarje)
app.use(express.static(join(__dirname, 'public')));

// Naloži rute
const userRouter = require('./routes/userRoutes');
const accountRouter = require('./routes/accountRoutes');
const statementRouter = require('./routes/statementRoutes');
const transactionRouter = require('./routes/transactionRoutes');
const locationRouter = require('./routes/locationRoutes');

// API rute
app.use('/users', userRouter);
app.use('/accounts', accountRouter);
app.use('/statements', statementRouter);
app.use('/transactions', transactionRouter);
app.use('/locations', locationRouter);

// Globalni error handler
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

// Zaženi strežnik le izven testnega okolja
if (process.env.NODE_ENV !== 'test') {
    app.listen(PORT, () => {
        console.log(`🚀 Server running on port ${PORT}`);
    });
}

// Izvozi app za testiranje
module.exports = app;
