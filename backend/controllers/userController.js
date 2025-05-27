const UserModel = require('../models/userModel.js');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { isOwner } = require("../utils/authorize");
const AccountController = require('./accountController');
const PartnerController = require('./partnerController');
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
    // TODO: Fix this
    show: function (req, res) {
        const id = req.user._id;

        UserModel.findOne({_id: id}, function (err, user) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when getting user.',
                    error: err
                });
            }

            if (!user) {
                return res.status(404).json({
                    message: 'No such user'
                });
            }

            return res.json(user);
        });
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
            const existingUser = await UserModel.findOne({ username: req.body.username });
            if (existingUser) {
                return res.status(400).json({
                    message: 'Username already taken.'
                });
            }

            const user = new UserModel({
                username: req.body.username,
                password: bcrypt.hashSync(req.body.password, 10),
                name: req.body.name,
                surname: req.body.surname,
                email: req.body.email,
                identifier: req.body.identifier,
                dateOfBirth: req.body.dateOfBirth
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
            return res.status(500).json({
                message: 'Error when creating user',
                error: err
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
            const id = req.params.id;
            const user = await UserModel.findOne({ _id: id });

            if (!user) {
                return res.status(404).json({ message: 'No such user' });
            }

            user.username = req.body.username || user.username;
            user.name = req.body.name || user.name;
            user.surname = req.body.surname || user.surname;
            user.email = req.body.email || user.email;
            user.identifier = req.body.identifier || user.identifier;
            user.address = req.body.address || user.address;
            user.dateOfBirth = req.body.dateOfBirth || user.dateOfBirth;

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
            const user = await UserModel.findById(req.params.id);

            if (!user) {
                console.log("User not found:", req.params.id);
                return res.status(404).json({ message: 'No such user' });
            }

            // Remove accounts using controller
            if (user.accounts?.length > 0) {
                for (const accountId of user.accounts) {
                    req.params.id = accountId; // nastavitev ID-ja v req.params
                    req.user = user; // nastavitev uporabnika za isOwner preverbo
                    await AccountController.remove(req, {
                        status: () => ({ json: () => {} }) // dummy response object
                    });
                }
            }

            // Remove partners using controller
            if (user.partners?.length > 0) {
                for (const partnerId of user.partners) {
                    req.params.id = partnerId;
                    req.user = user;
                    await PartnerController.remove(req, {
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

            if (req.user._id.toString() !== userId.toString()) {
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
                                path: 'partner_parsed'
                            }
                        }
                    }
                })
                .populate('partners');

            if (!user) return res.status(404).json({ error: 'User not found' });

            // Statistika po partnerjih na ravni uporabnika
            const partnerStats = {};

            for (const acc of user.accounts) {
                for (const stmt of acc.statements) {
                    for (const txn of stmt.transactions) {
                        const partner = txn.partner_parsed;
                        if (partner) {
                            const key = partner._id.toString();
                            if (!partnerStats[key]) {
                                partnerStats[key] = {
                                    name: partner.name,
                                    number_of_transactions: 0,
                                    amount: 0
                                };
                            }
                            partnerStats[key].number_of_transactions += 1;
                            partnerStats[key].amount += txn.change;
                        }
                    }
                }
            }

            // Statistika po računih in izpiskih
            const accounts = {};
            for (const acc of user.accounts) {
                const accStats = {
                    name: acc.iban,
                    balance: acc.balance,
                    transactions: 0,
                    in: 0,
                    out: 0,
                    partners: {},
                    statements: []
                };

                for (const stmt of acc.statements) {
                    const stmtStats = {
                        month: stmt.month,
                        year: stmt.year,
                        total_transactions: stmt.transactions.length,
                        in: stmt.inflow,
                        out: stmt.outflow,
                        balance: stmt.endBalance,
                        partners: {}
                    };

                    for (const txn of stmt.transactions) {
                        const partner = txn.partner_parsed;
                        accStats.transactions += 1;
                        if (txn.change >= 0) accStats.in += txn.change;
                        else accStats.out += Math.abs(txn.change);

                        if (partner) {
                            const key = partner._id.toString();

                            if (!accStats.partners[key]) {
                                accStats.partners[key] = {
                                    name: partner.name,
                                    number_of_transactions: 0,
                                    amount: 0
                                };
                            }
                            if (!stmtStats.partners[key]) {
                                stmtStats.partners[key] = {
                                    name: partner.name,
                                    number_of_transactions: 0,
                                    amount: 0
                                };
                            }

                            accStats.partners[key].number_of_transactions += 1;
                            accStats.partners[key].amount += txn.change;

                            stmtStats.partners[key].number_of_transactions += 1;
                            stmtStats.partners[key].amount += txn.change;
                        }
                    }

                    accStats.statements.push(stmtStats);
                }

                accounts[acc._id.toString()] = accStats;
            }

            res.json({
                user: {
                    name: user.name,
                    partners: Object.values(partnerStats),
                    accounts
                }
            });

        } catch (err) {
            console.error(err);
            console.error("Napaka v getUserStatistics:", err.message, err.stack);
            res.status(500).json({ error: 'Napaka pri pridobivanju statistike' });
        }
    }
};
