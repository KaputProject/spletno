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

            if (family.users.includes(req.body.user)) {
                return res.status(400).json({ message: 'User is already a member of this family' });
            }

            family.users.push(req.body.user);

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
        try {
            const family = await FamilyModel.findById(req.params.id).populate('users');

            if (!family) {
                return res.status(404).json({ message: 'No such family found' });
            }

            // Collect family members list
            const familyMembers = (family.users || []).map(u => ({
                _id: u._id ? u._id : u,
                username: u.username || null
            }));

            // Map of grouped locations
            const locMap = {}; // key -> { meta..., total_inflow, total_outflow, number_of_transactions, users: { userId: {...} } }

            const processTxnForLocation = (loc, user, inflow, outflow) => {
                if (!loc) return;

                const groupKey = loc.identifier
                    ? `identifier:${loc.identifier}`
                    : loc.address
                        ? `address:${loc.address}`
                        : `id:${loc._id?.toString() || ''}`;

                if (!locMap[groupKey]) {
                    locMap[groupKey] = {
                        _id: loc._id || null,
                        name: loc.name || null,
                        lat: loc.lat || null,
                        lng: loc.lng || null,
                        address: loc.address || null,
                        identifier: loc.identifier || null,
                        total_inflow: 0,
                        total_outflow: 0,
                        number_of_transactions: 0,
                        users: {}
                    };
                }

                const entry = locMap[groupKey];
                entry.total_inflow += inflow;
                entry.total_outflow += outflow;
                entry.number_of_transactions += 1;

                const uid = user._id.toString();
                if (!entry.users[uid]) {
                    entry.users[uid] = {
                        userId: uid,
                        username: user.username || null,
                        numbOfTrans: 0,
                        inflow: 0,
                        outflow: 0
                    };
                }

                entry.users[uid].numbOfTrans += 1;
                entry.users[uid].inflow += inflow;
                entry.users[uid].outflow += outflow;
            };

            const processSavedLocationForUser = (loc, user) => {
                if (!loc) return;

                const groupKey = loc.identifier
                    ? `identifier:${loc.identifier}`
                    : loc.address
                        ? `address:${loc.address}`
                        : `id:${loc._id?.toString() || ''}`;

                if (!locMap[groupKey]) {
                    locMap[groupKey] = {
                        _id: loc._id || null,
                        name: loc.name || null,
                        lat: loc.lat || null,
                        lng: loc.lng || null,
                        address: loc.address || null,
                        identifier: loc.identifier || null,
                        total_inflow: 0,
                        total_outflow: 0,
                        number_of_transactions: 0,
                        users: {}
                    };
                }

                const entry = locMap[groupKey];

                const userInflow = loc.total_received || 0;
                const userOutflow = loc.total_spent || 0;
                const userNum = loc.number_of_transactions || 0;

                entry.total_inflow += userInflow;
                entry.total_outflow += userOutflow;
                entry.number_of_transactions += userNum;

                const uid = user._id.toString();
                if (!entry.users[uid]) {
                    entry.users[uid] = {
                        userId: uid,
                        username: user.username || null,
                        numbOfTrans: 0,
                        inflow: 0,
                        outflow: 0
                    };
                }

                entry.users[uid].numbOfTrans += userNum;
                entry.users[uid].inflow += userInflow;
                entry.users[uid].outflow += userOutflow;
            };

            // Iterate users and collect transactions and saved locations
            for (const userRef of family.users) {
                const user = await UserModel.findById(userRef._id ? userRef._id : userRef)
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
                    .populate('locations');

                if (!user) continue;

                // Transactions from accounts/statements
                for (const acc of user.accounts || []) {
                    for (const stmt of acc.statements || []) {
                        for (const txn of stmt.transactions || []) {
                            const loc = txn.location;
                            if (!loc) continue;

                            const inflow = txn.outgoing ? 0 : (txn.change || 0);
                            const outflow = txn.outgoing ? (txn.change || 0) : 0;

                            processTxnForLocation(loc, user, inflow, outflow);
                        }
                    }
                }

                // Also include user's saved locations (aggregate totals) to capture locations without txn or extra totals
                for (const loc of user.locations || []) {
                    processSavedLocationForUser(loc, user);
                }
            }

            // Convert locMap to array and transform users map to array
            const locations = Object.values(locMap).map(loc => {
                return {
                    _id: loc._id,
                    name: loc.name,
                    lat: loc.lat,
                    lng: loc.lng,
                    address: loc.address,
                    identifier: loc.identifier,
                    total_inflow: loc.total_inflow,
                    total_outflow: loc.total_outflow,
                    number_of_transactions: loc.number_of_transactions,
                    users: Object.values(loc.users)
                };
            });

            return res.json({
                message: 'Family statistics retrieved successfully',
                familyMembers,
                statistics: locations
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
