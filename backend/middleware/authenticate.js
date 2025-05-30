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

        const targetUserId = req.body.userId;

        if (user.isAdmin && targetUserId) {
            const targetUser = await UserModel.findById(targetUserId).select('-password');
            if (!targetUser) return res.status(404).json({ error: 'Target user not found' });

            // If an admin is performing an action on another user, set that user as req.user
            req.user = targetUser;
            req.admin = user;
        } else {
            req.user = user;
        }

        next();
    } catch (err) {
        console.error('Auth error:', err);
        return res.sendStatus(403);
    }
};