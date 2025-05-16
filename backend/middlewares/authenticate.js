const jwt = require('jsonwebtoken');
const UserModel = require('../models/userModel');

module.exports = (req, res, next) => {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.sendStatus(401);

    jwt.verify(token, process.env.JWT_SECRET_TOKEN, (err, userId) => {
        if (err) return res.sendStatus(403);
        req.user = UserModel.findById(userId, '-password');

        next();
    });
};