const UserModel = require('../models/userModel.js');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const AccountController = require('./accountController');
const LocationController = require('./locationController');
const fs = require('fs');
const path = require('path');

/**
 * userController.js
 *
 * @description :: Server-side logic for managing users.
 */
module.exports = {

    /**
     * userController.validate()
     *
     * @param req
     * @param res
     * @returns {Promise<*>}
     */
    validate: async (req, res) => {
        try {
            return res.status(200).json({
                message: 'Token is valid',
                user: req.user
            });
        } catch (err) {
            console.error("Error during token validate:", err);
            return res.status(500).json({ message: 'Server error', error: err });
        }
    },

    /**
     * userController.login()
     *
     * @param req
     * @param res
     * @returns {Promise<*>}
     */
    login: async (req, res) => {
        try {
            const { username, password } = req.body;

            if (!username || !password) {
                return res.status(400).json({ message: 'Username and password are required.' });
            }

            const user = await UserModel.findOne({ username: username });
            if (!user) {
                return res.status(404).json({ message: 'User not found.' });
            }

            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return res.status(401).json({ message: 'Incorrect password.' });
            }

            const token = jwt.sign(
                { userId: user._id },
                process.env.JWT_SECRET_TOKEN,
                { expiresIn: process.env.JWT_EXPIRES_IN }
            );

            return res.status(200).json({
                message: 'User logged in successfully.',
                user: user,
                token: token
            });
        } catch (err) {
            console.error('Login error:', err);
            return res.status(500).json({
                message: 'Internal server error.',
                error: err.message || err
            });
        }
    },

    /**
     * userController.list()
     */
    list: async function (req, res) {
        try {
            // Returns the users without the password field
            const users = await UserModel.find({}, '-password');

            return res.json(users);
        } catch (err) {
            return res.status(500).json({
                message: 'Error when getting users.',
                error: err
            });
        }
    },

    /**
     * userController.show()
     */
    show: async function (req, res) {
        try {
            const id = req.user._id;

            const user = await UserModel.findById(id).select('-password');

            if (!user) {
                return res.status(404).json({ message: 'No such user' });
            }

            return res.json(user);
        } catch (err) {
            return res.status(500).json({
                message: 'Error when getting user.',
                error: err
            });
        }
    },

    /**
     * userController.create()
     *
     * @param req
     * @param res
     * @returns {Promise<*>}
     */
    create: async function (req, res) {
        try {
            const existingUser = await UserModel.findOne({
                $or: [
                    { username: req.body.username },
                    { email: req.body.email }
                ]
            });

            if (existingUser) {
                if (existingUser.username === req.body.username) {
                    return res.status(400).json({ message: 'Username already taken.' });
                }
                if (existingUser.email === req.body.email) {
                    return res.status(400).json({ message: 'Email already taken.' });
                }
            }

            const user = new UserModel({
                username: req.body.username,
                password: bcrypt.hashSync(req.body.password, 10),
                name: req.body.name,
                surname: req.body.surname,
                email: req.body.email,
                identifier: req.body.identifier,
                dateOfBirth: req.body.dateOfBirth,
                isAdmin: req.body.isAdmin || false,
            });

            await user.save();

            const token = jwt.sign(
                { userId: user._id },
                process.env.JWT_SECRET_TOKEN,
                { expiresIn: process.env.JWT_EXPIRES_IN }
            );

            return res.json({
                message: 'User created successfully.',
                user: user,
                token: token
            });
        } catch (err) {
            console.error('Error in userController.create:', err)
            return res.status(500).json({
                message: 'Error when creating user',
                error: err,
            });
        }
    },

    /**
     * userController.update()
     *
     * @param req
     * @param res
     * @returns {Promise<*>}
     */
    update: async function (req, res) {
        try {
            const user = await UserModel.findOne({ _id: req.user._id });

            if (!user) {
                return res.status(404).json({ message: 'No such user' });
            }

            user.username = req.body.username || user.username;
            user.name = req.body.name || user.name;
            user.surname = req.body.surname || user.surname;
            user.email = req.body.email || user.email;
            user.dateOfBirth = req.body.dateOfBirth || user.dateOfBirth;
            user.identifier = req.body.identifier || user.identifier;

            if (req.body.password) {
                const salt = await bcrypt.genSalt(10);
                user.password = await bcrypt.hash(req.body.password, salt);
            }

            if (req.file) {
                if (user.avatarUrl) {
                    const otherUsers = await UserModel.find({
                        _id: { $ne: user._id },
                        avatarUrl: user.avatarUrl
                    });

                    if (otherUsers.length === 0) {
                        const oldPath = path.join(__dirname, '..', 'public', user.avatarUrl);
                        if (fs.existsSync(oldPath)) {
                            fs.unlinkSync(oldPath);
                        }
                    }
                }

                user.avatarUrl = `/avatars/${req.file.filename}`;
            }

            const updatedUser = await user.save();
            return res.json(updatedUser);
        } catch (err) {
            return res.status(500).json({
                message: 'Error when updating user.',
                error: err
            });
        }
    },

    /**
     * userController.remove()
     *
     * @param req
     * @param res
     * @returns {Promise<*>}
     */
    remove: async function (req, res) {
        try {
            const user = await UserModel.findById(req.user._id);

            if (!user) {
                console.log("User not found:", req.params.id);
                return res.status(404).json({ message: 'No such user' });
            }

            if (user.avatarUrl) {
                const otherUsers = await UserModel.find({
                    _id: { $ne: user._id },
                    avatarUrl: user.avatarUrl
                });

                if (otherUsers.length === 0) {
                    const avatarPath = path.join(__dirname, '..', 'public', user.avatarUrl);
                    if (fs.existsSync(avatarPath)) {
                        fs.unlinkSync(avatarPath);
                    }
                }
            }

            // Remove accounts using controller
            if (user.accounts?.length > 0) {
                for (const accountId of user.accounts) {
                    req.params.id = accountId;
                    req.user = user;
                    await AccountController.remove(req, {
                        status: () => ({ json: () => {} })
                    });
                }
            }

            // Remove partners using controller
            if (user.locations?.length > 0) {
                for (const locationId of user.locations) {
                    req.params.id = locationId;
                    req.user = user;
                    await LocationController.remove(req, {
                        status: () => ({ json: () => {} })
                    });
                }
            }

            await user.deleteOne();

            return res.status(200).json({ message: 'User removed successfully' });

        } catch (err) {
            return res.status(500).json({
                message: 'Error when deleting a user.',
                error: err
            });
        }
    },

    /**
     * userController.getUserStatistics()
     *
     * @param req
     * @param res
     * @returns {Promise<*>}
     */
    getUserStatistics: async function (req, res) {
        try {
            const userId = req.params.id;

            if (req.user._id.toString() !== userId) {
                return res.status(403).json({ error: 'Ni dovoljenja za dostop do teh podatkov' });
            }

            const user = await UserModel.findById(userId)
                .populate({
                    path: 'accounts',
                    populate: {
                        path: 'statements',
                        populate: {
                            path: 'transactions',
                            populate: {
                                path: 'location'
                            }
                        }
                    }
                })
                .populate({
                    path: 'locations',
                });

            if (!user) return res.status(404).json({ error: 'User not found' });

            // Location stats: use model attributes
            const locationStats = {};
            for (const loc of user.locations || []) {
                locationStats[loc._id.toString()] = {
                    _id: loc._id,
                    name: loc.name,
                    inflow: loc.total_received || 0,
                    outflow: loc.total_spent || 0,
                    number_of_transactions: 0 // will be counted below
                };
            }

            // Account and transaction stats
            const accounts = [];
            for (const acc of user.accounts || []) {
                const accStats = {
                    _id: acc._id,
                    name: acc.iban,
                    balance: acc.balance,
                    transactions: 0,
                    inflow: 0,
                    outflow: 0,
                    locations: {},
                    statements: []
                };

                for (const stmt of acc.statements || []) {
                    const transactions = stmt.transactions || [];
                    const stmtStats = {
                        month: stmt.month,
                        year: stmt.year,
                        total_transactions: transactions.length,
                        inflow: 0,
                        outflow: 0,
                        balance: stmt.endBalance,
                        locations: {},
                        transactions: []
                    };

                    for (const txn of transactions) {
                        const location = txn.location;
                        accStats.transactions += 1;

                        // Transaction inflow/outflow
                        const inflow = txn.outgoing ? 0 : txn.change;
                        const outflow = txn.outgoing ? txn.change : 0;
                        accStats.inflow += inflow;
                        accStats.outflow += outflow;
                        stmtStats.inflow += inflow;
                        stmtStats.outflow += outflow;

                        stmtStats.transactions.push({
                            _id: txn._id,
                            date: txn.date || txn.datetime || null,
                            datetime: txn.datetime || txn.date || null,
                            description: txn.description,
                            inflow,
                            outflow,
                            outgoing: txn.outgoing,
                            location: location ? {
                                _id: location._id,
                                name: location.name,
                                email: location.email || null
                            } : null
                        });

                        // Per-location stats for account/statement
                        if (location) {
                            const key = location._id.toString();
                            if (!accStats.locations[key]) {
                                accStats.locations[key] = {
                                    _id: location._id,
                                    name: location.name,
                                    inflow: 0,
                                    outflow: 0,
                                    number_of_transactions: 0
                                };
                            }
                            if (!stmtStats.locations[key]) {
                                stmtStats.locations[key] = {
                                    _id: location._id,
                                    name: location.name,
                                    inflow: 0,
                                    outflow: 0,
                                    number_of_transactions: 0
                                };
                            }
                            accStats.locations[key].inflow += inflow;
                            accStats.locations[key].outflow += outflow;
                            accStats.locations[key].number_of_transactions += 1;
                            stmtStats.locations[key].inflow += inflow;
                            stmtStats.locations[key].outflow += outflow;
                            stmtStats.locations[key].number_of_transactions += 1;

                            // Count transactions for global location stats
                            if (locationStats[key]) {
                                locationStats[key].number_of_transactions += 1;
                            }
                        }
                    }
                    stmtStats.locations = Object.values(stmtStats.locations);
                    accStats.statements.push(stmtStats);
                }
                accStats.locations = Object.values(accStats.locations);
                accounts.push(accStats);
            }

            res.json({
                user: {
                    _id: user._id,
                    name: user.name,
                    surname: user.surname,
                    username: user.username,
                    email: user.email,
                    dateOfBirth: user.dateOfBirth,
                    avatarUrl: user.avatarUrl,
                    locations: Object.values(locationStats),
                    accounts
                }
            });

        } catch (err) {
            console.error("Napaka v getUserStatistics:", err.message, err.stack);
            res.status(500).json({ error: 'Napaka pri pridobivanju statistike' });
        }
    },

    /**
     * Used for unit testing purposes
     *
     * @param req
     * @param res
     * @returns {Promise<*>}
     */
    echo: async function (req, res) {
        return res.status(200).json({ received: req.body });
    }
};
