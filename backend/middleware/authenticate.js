const jwt = require('jsonwebtoken');
const UserModel = require('../models/userModel');

module.exports = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.sendStatus(401);

    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET_TOKEN);
        const user = await UserModel.findById(payload.userId).select('-password');

        if (!user) return res.sendStatus(401);

        req.user = user;
        next();
    } catch (err) {
        return res.sendStatus(403);
    }
};