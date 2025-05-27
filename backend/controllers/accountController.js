const AccountModel = require('../models/accountModel.js');
const {isOwner} = require("../utils/authorize");
const StatementController = require('./statementController');
const StatementModel = require("../models/statementModel");
/**
 * accountController.js
 *
 * @description :: Server-side logic for managing accounts.
 */
module.exports = {

    /**
     * accountController.show()
     *
     * @param req
     * @param res
     * @returns {Promise<*>}
     */
    show: async function (req, res) {
        try {
            const account = await AccountModel.findById(req.params.id)
                .populate('statements');

            if (!account) {
                return res.status(404).json({ message: 'Account not found' });
            }

            if (!isOwner(account, req.user)) {
                return res.status(403).json({ message: 'Forbidden: Not the account owner' });
            }

            res.json({
                message: 'Account details retrieved successfully',
                account: account
            });
        } catch (err) {
            res.status(500).json({
                message: 'Error when fetching an account',
                error: err
            });
        }
    },

    /**
     * accountController.list()
     *
     * @param req
     * @param res
     * @returns {Promise<void>}
     */
    list: async function (req, res) {
        try {
            const accounts = await AccountModel.find({ user: req.user._id });

            res.json({
                message: 'Users accounts retrieved successfully',
                accounts: accounts
            });
        } catch (err) {
            res.status(500).json({
                message: 'Error when fetching accounts',
                error: err
            });
        }
    },

    /**
     * Create a new account
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
            req.user.accounts.push(savedAccount._id);

            await req.user.save();
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

            res.json({
                message: 'Account updated successfully',
                account: updatedAccount
            });
        } catch (err) {
            res.status(500).json({
                message: 'Error when updating account.',
                error: err
            });
        }
    },

    /**
     * Delete an account
     *
     * TODO: Make sure all the related statements get deleted as well
     */
    remove : async function (req, res) {
        try {
            const account = await AccountModel.findById(req.params.id);

            if (!account) {
                return res.status(404).json({ message: 'No such account found' });
            }

            // Remove statements using a controller
            if (account.statements?.length > 0) {
                for (const statementId of account.statements) {
                    req.params.id = statementId;
                    req.user = req.user || account.user;
                    await StatementController.remove(req, {
                        status: () => ({ json: () => {} })
                    });
                }
            }

            await account.deleteOne();

            return res.status(200).json({ message: 'Account deleted successfully' });
        } catch (err) {
            res.status(500).json({
                message: 'Error when deleting the account.',
                error: err
            });
        }
    }
};
