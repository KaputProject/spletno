const TransactionModel = require('../models/transactionModel');
const StatementModel = require('../models/statementModel');
const LocationModel = require('../models/locationModel');
const AccountModel = require('../models/accountModel');

const { isOwner } = require('../utils/authorize');
const moment = require("moment/moment");

module.exports = {

    /**
     * transactionController.parse()
     *
     * @param data
     * @param iban
     * @param user
     * @returns {Promise<*>}
     */
    parse: async function (data, iban, user) {
        try {
            const date = new Date(data.datetime);
            const month = date.getMonth();
            const year = date.getFullYear();

            const account = await AccountModel.findOne({ iban: iban });
            if (!account) {
                return { message: 'Account not found' };
            }

            // Checks if a statement(month), to which this transaction belongs to exists
            let statement = await StatementModel.findOne({
                account: account,
                month: month,
                year: year
            });

            // If not, a new one is created
            if (!statement) {
                statement = new StatementModel({
                    user: user._id,
                    account: account,
                    month: month,
                    year: year,
                    startDate: new Date(year, month, 1),
                    endDate: new Date(year, month + 1, 0)
                });
                await statement.save();

                account.statements.push(statement);
                account.save();
            }

            let location = null;
            if (data.known_partner) {
                // If a location is provided, check if it exists
                location = await LocationModel.findOne({ user: user._id, identifier: data.partner });
                if (!location) {
                    return { message: 'Location not even though the data.known_partner is true found' };
                }
            }

            let original_location = null;
            if (!data.known_partner) {
                if (data.outgoing) {
                    original_location = data.description
                } else {
                    original_location = data.partner;
                }

            }

            const transaction = new TransactionModel({
                user: user._id,
                account: account,
                location: location?._id || null,
                datetime: data.datetime,
                description: data.description || null,
                change: data.change,
                outgoing: data.outgoing,
                statement: statement._id,
                reference: data.reference,
                original_location: original_location,
            });

            // TODO: Check for duplicates
            // TODO: Modify the partners total_spent and total_gained accordingly

            const savedTransaction = await transaction.save();

            statement.transactions.push(savedTransaction._id);
            await statement.save();

            if (location) {
                location.transaction.push(savedTransaction._id);
                if (savedTransaction.outgoing) {
                    location.total_spent += savedTransaction.change;
                } else {
                    location.total_received += savedTransaction.change;
                }
                await location.save();
            }

            return {
                message: 'Transaction parsed successfully',
                transaction: savedTransaction
            };
        } catch (err) {
            return {
                message: 'Error when parsing transaction.',
                error: err
            };
        }
    },

    /**
     * transactionController.list()
     *
     * @param req
     * @param res
     * @returns {Promise<*>}
     */
    list: async function (req, res) {
        try {
            const account = req.params.account;

            let transactions = []
            if (!account) {
                transactions = await TransactionModel.find({user: req.user._id})
                    .populate({
                        path: 'location',
                        select: '_id name'
                    })
                    .populate({
                        path: 'account',
                        select: '_id iban'
                    })
                    .sort({ datetime: -1 });
            } else {
                transactions = await TransactionModel.find({user: req.user._id, account: account})
                    .populate({
                        path: 'location',
                        select: '_id name'
                    })
                    .populate({
                        path: 'account',
                        select: '_id iban'
                    })
                    .sort({ datetime: -1 });
            }

            return res.json({
                message: 'Users transactions successfully fetched',
                transactions: transactions
            });
        } catch (err) {
            return res.status(500).json({
                message: 'Error when getting transactions.',
                error: err
            });
        }
    },

    /**
     * transactionController.show()
     *
     * @param req
     * @param res
     * @returns {Promise<*>}
     */
    show: async function (req, res) {
        try {
            const transaction = await TransactionModel.findById(req.params.id)
                .populate('location')
                .populate('user', '--password')
                .populate('account');

            if (!transaction) {
                return res.status(404).json({ message: 'No such transaction' });
            }

            if (!isOwner(transaction, req.user)) {
                return res.status(403).json({ message: 'Forbidden: Not your transaction' });
            }

            return res.json({
                message: 'Transaction fetched successfully',
                transaction: transaction
            });
        } catch (err) {
            return res.status(500).json({
                message: 'Error when getting transaction.',
                error: err
            });
        }
    },

    /**
     * transactionController.create()
     *
     * @param req
     * @param res
     * @param next
     * @returns {Promise<*>}
     */
    create: async function (req, res, next) {
        try {
            const { datetime, account: accountId, description, change, outgoing, location: locationId } = req.body;

            const date = new Date(datetime);
            const month = date.getMonth();
            const year = date.getFullYear();

            const account = await AccountModel.findById(accountId);
            if (!account) {
                return res.status(404).json({ message: 'Account not found' });
            }

            // Checks if a statement(month), to which this transaction belongs to exists
            let statement = await StatementModel.findOne({
                account: account,
                month: month,
                year: year
            });

            // If not, a new one is created
            if (!statement) {
                statement = new StatementModel({
                    user: req.user._id,
                    account: account,
                    month: month,
                    year: year,
                    startDate: new Date(year, month, 1),
                    endDate: new Date(year, month + 1, 0)
                });
                await statement.save();

                account.statements.push(statement);
                account.save();
            }

            let location = null;
            if (locationId) {
                // If a location is provided, check if it exists
                location = await LocationModel.findOne({ _id: locationId });
                if (!location) {
                    return res.status(404).json({ message: 'Location not found' });
                }
            }

            const transaction = new TransactionModel({
                user: req.user._id,
                account: account,
                location: location?._id || null,
                datetime: datetime,
                description: description || null,
                change: change,
                outgoing: outgoing,
                statement: statement._id
            });

            const savedTransaction = await transaction.save();

            // Transaction is added to the statement
            statement.transactions.push(savedTransaction._id);
            await statement.save();

            // If the transaction has a location, the transaction is added to the location itself
            if (location) {
                transaction.outgoing ? location.total_spent += transaction.change : location.total_gained += transaction.change;
                location.transactions.push(savedTransaction._id);
                await location.save();
            }

            return res.status(201).json({
                message: 'Transaction created successfully',
                transaction: savedTransaction
            });
        } catch (err) {
            return next(err);
        }
    },

    /**
     * transactionController.update()
     *
     * @param req
     * @param res
     * @returns {Promise<*>}
     */
    update: async function (req, res) {
        try {
            const transaction = await TransactionModel.findById(req.params.id);

            if (!transaction) {
                return res.status(404).json({ message: 'No such transaction' });
            }

            if (!isOwner(transaction, req.user)) {
                return res.status(403).json({ message: 'Forbidden: Not your transaction' });
            }

            transaction.datetime = req.body.datetime ?? transaction.datetime;
            transaction.reference = req.body.reference ?? transaction.reference;
            transaction.partner_original = req.body.partner_original ?? transaction.partner_original;
            transaction.description = req.body.description ?? transaction.description;
            transaction.amount = req.body.amount ?? transaction.amount;
            transaction.balanceAfter = req.body.balanceAfter ?? transaction.balanceAfter;
            transaction.outgoing = req.body.outgoing ?? transaction.outgoing;
            transaction.known_partner = req.body.known_partner ?? transaction.known_partner;
            transaction.partner_parsed = req.body.partner_parsed ?? transaction.partner_parsed;

            const updatedTransaction = await transaction.save();
            return res.json(updatedTransaction);
        } catch (err) {
            return res.status(500).json({
                message: 'Error when updating transaction.',
                error: err
            });
        }
    },

    /**
     * transactionController.remove()
     *
     * @param req
     * @param res
     * @returns {Promise<*>}
     */
    remove: async function (req, res) {
        try {
            const transaction = await TransactionModel.findById(req.params.id);

            if (!transaction) {
                return res.status(404).json({ message: 'No such transaction' });
            }

            await transaction.deleteOne();

            return res.status(200).json({ message: 'Transaction removed successfully' });
        } catch (err) {
            return res.status(500).json({
                message: 'Error when deleting transaction.',
                error: err
            });
        }
    }


};
