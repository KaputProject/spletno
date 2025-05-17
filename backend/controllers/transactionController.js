const TransactionModel = require('../models/transactionModel');
const StatementModel = require('../models/statementModel');
const PartnerModel = require('../models/partnerModel');

const { isOwner } = require('../utils/authorize');
const moment = require("moment/moment");

module.exports = {

    /**
     * transactionController.parse()
     *
     * @param req
     * @param res
     * @returns {Promise<*>}
     */
    parse: async function (req, res) {
        try {
            const date = moment(req.body.date, 'DD.MM.YYYY').toDate();
            const statement = await StatementModel.findById( req.body.statementId );

            if (!statement) {
                return res.status(404).json({
                    message: `Account with ID: "${req.body.iban}" not found, please create it first.`
                });
            }

            if (!isOwner(statement, req.user)) {
                return res.status(403).json({
                    message: 'Forbidden: Not your statement'
                });
            }

            var transaction = new TransactionModel({
                user: req.user._id,
                statement: statement._id,
                datetime: date,
                reference: req.body.reference,
                partner_original: req.body.partner,
                description: req.body.description,
                change: req.body.change,
                balanceAfter: req.body.balance,
                outgoing: req.body.outgoing,
            });

            // Looks for a partner with the matching identifier AND owned by this user
            const partner = await PartnerModel.findOne({
                identifier: req.body.partner,
                user: req.user._id
            });

            if (partner) {
                transaction.known_partner = true;
                transaction.partner_parsed = partner._id;
            }

            const savedTransaction = await transaction.save();

            return res.json({
                message: 'Transaction parsed successfully',
                transaction: savedTransaction
            });
        } catch (err) {
            return res.status(500).json({
                message: 'Error when parsing transaction.',
                error: err
            });
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
            const transactions = await TransactionModel.find({user: req.user._id})
                .populate('partner_parsed');

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
                .populate('partner_parsed')
                .populate('user', '--password');

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
     * @returns {Promise<*>}
     */
    create: async function (req, res) {
        const transaction = new TransactionModel({
            datetime: req.body.datetime,
            reference: req.body.reference,
            partner_original: req.body.partner_original,
            description: req.body.description,
            change: req.body.change,
            balanceAfter: req.body.balance,
            outgoing: req.body.outgoing,
            known_partner: req.body.known_partner,
            partner_parsed: req.body.partner_parsed
        });

        if (!isOwner(transaction, req.user)) {
            return res.status(403).json({ message: 'Forbidden: Cannot create transaction for another user' });
        }

        try {
            const savedTransaction = await transaction.save();
            return res.status(201).json(savedTransaction);
        } catch (err) {
            return res.status(500).json({
                message: 'Error when creating transaction.',
                error: err
            });
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

            if (!isOwner(transaction, req.user)) {
                return res.status(403).json({ message: 'Forbidden: Not your transaction' });
            }

            await transaction.deleteOne();

            return res.status(204).send();
        } catch (err) {
            return res.status(500).json({
                message: 'Error when deleting transaction.',
                error: err
            });
        }
    }
};
