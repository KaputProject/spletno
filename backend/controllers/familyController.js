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
