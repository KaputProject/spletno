const FamilyModel = require('../models/familyModel.js');
const UserModel = require('../models/userModel.js');

/**
 * familyController.js
 *
 * @description :: Server-side logic for managing families.
 */
module.exports = {
    /**
     * accountController.get()
     *
     * @param req
     * @param res
     * @returns {Promise<void>}
     */
    get: async function (req, res) {
        try {
            const user = await UserModel.findById(req.user._id).populate('family');

            if (!user) {
                console.log("User not found:", req.params.id);
                return res.status(404).json({ message: 'No such user' });
            }

            if (user.family != null) {
                res.json({
                    message: 'Users family retrieved successfully',
                    family: user.family
                });
            } else {
                res.status(404).json({
                    message: 'User has no family'
                });
            }


        } catch (err) {
            res.status(500).json({
                message: 'Error when fetching users family.',
                error: err
            });
        }
    },

    /**
     * Create a new account
     */
    create: async function (req, res) {
        try {
            const family = new FamilyModel({
                name: req.body.name,
                users: [req.user._id]
            });

            const savedFamily = await family.save();
            req.user.family = savedFamily._id;

            await req.user.save();
            res.status(201).json({
                message: 'Family created successfully',
                account: savedFamily
            });
        } catch (err) {
            console.log(err)
            res.status(500).json({
                message: 'Error when creating account',
                error: err
            });
        }
    },

    /**
     * Adds an user to the family
     */
    addUser: async function (req, res) {
        try {
            const family = await FamilyModel.findById(req.params.id);

            if (!family) {
                return res.status(404).json({ message: 'No such family found' });
            }

            if (family.users.includes(req.params.id)) {
                return res.status(400).json({ message: 'User is already a member of this family' });
            }

            family.users.push(req.params.id);

            const updatedFamily = await family.save();

            res.json({
                message: 'Family member added successfully',
                account: updatedFamily
            });
        } catch (err) {
            res.status(500).json({
                message: 'Error when adding family member.',
                error: err
            });
        }
    },

    getStatistics: async function (req, res) {
        let output = [];
        try {
            const family = await FamilyModel.findById(req.params.id).populate('users');

            if (!family) {
                return res.status(404).json({message: 'No such family found'});
            }

            for (const userId of family.users) {
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

                // Location stats: use model attributes
                const locationStats = {};
                for (const loc of user.locations || []) {
                    locationStats[loc._id.toString()] = {
                        _id: loc._id,
                        name: loc.name,
                        inflow: loc.total_received || 0,
                        outflow: loc.total_spent || 0,
                        number_of_transactions: 0,
                        lat: loc.lat || null,
                        lng: loc.lng || null
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


                output.push(
                    {
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
                );
            }

            return res.json({
                message: 'Family statistics retrieved successfully',
                statistics: output
            });
        } catch (error) {
            return res.status(500).json({
                message: 'Error when fetching family statistics.',
                error: error.toString()
            });
        }
    }
    //
    // /**
    //  * Delete an account
    //  *
    //  * TODO: Make sure all the related statements get deleted as well
    //  */
    // remove : async function (req, res) {
    //     try {
    //         const account = await FamilyModel.findById(req.params.id);
    //
    //         if (!account) {
    //             return res.status(404).json({ message: 'No such account found' });
    //         }
    //
    //         // Remove statements using a controller
    //         if (account.statements?.length > 0) {
    //             for (const statementId of account.statements) {
    //                 req.params.id = statementId;
    //                 req.user = req.user || account.user;
    //                 await StatementController.remove(req, {
    //                     status: () => ({ json: () => {} })
    //                 });
    //             }
    //         }
    //
    //         await account.deleteOne();
    //
    //         return res.status(200).json({ message: 'Account deleted successfully' });
    //     } catch (err) {
    //         res.status(500).json({
    //             message: 'Error when deleting the account.',
    //             error: err
    //         });
    //     }
    // }
};
