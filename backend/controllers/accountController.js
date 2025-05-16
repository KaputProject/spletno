const AccountModel = require('../models/accountModel.js');
const {isOwner} = require("../helpers/authorize");

/**
 * accountController.js
 *
 * @description :: Server-side logic for managing accounts.
 */
module.exports = {

    /**
     * Create new account
     */
    create: async function (req, res) {
        try {
            const account = new AccountModel({
                user: req.user._id,
                iban: req.body.iban,
                currency: req.body.currency,
                balance: req.body.balance,
                statements: [],
            });

            const savedAccount = await account.save();
            res.status(201).json({
                message: 'Account created successfully',
                account: savedAccount
            });
        } catch (err) {
            res.status(500).json({
                message: 'Error when creating account',
                error: err
            });
        }
    },

    /**
     * Update an existing account
     */
    update: async function (req, res) {
        try {
            const account = await AccountModel.findById(req.params.id);

            if (!account) {
                return res.status(404).json({ message: 'No such account found' });
            }

            if (!isOwner(account, req.user)) {
                return res.status(403).json({ message: 'Forbidden: Not the account owner' });
            }

            account.iban = req.body.iban ?? account.iban;
            account.currency = req.body.currency ?? account.currency;
            account.balance = req.body.balance ?? account.balance;

            const updatedAccount = await account.save();

            res.json(updatedAccount);
        } catch (err) {
            res.status(500).json({
                message: 'Error when updating account.',
                error: err
            });
        }
    },

    /**
     * Delete an account
     */
    remove: async function (req, res) {
        try {
            const account = await AccountModel.findById(req.params.id);

            if (!account) {
                return res.status(404).json({ message: 'No such account found' });
            }

            if (!isOwner(account, req.user)) {
                return res.status(403).json({ message: 'Forbidden: Not the account owner' });
            }

            await account.deleteOne();

            res.status(200).send({
                message: 'Account deleted successfully'
            });
        } catch (err) {
            res.status(500).json({
                message: 'Error when deleting the account.',
                error: err
            });
        }
    }
};
