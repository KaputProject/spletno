var TransactionModel = require('../models/transactionModel.js');

/**
 * transactionController.js
 *
 * @description :: Server-side logic for managing transactions.
 */
module.exports = {

    /**
     * transactionController.list()
     */
    list: function (req, res) {
        TransactionModel.find(function (err, transactions) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when getting transaction.',
                    error: err
                });
            }

            return res.json(transactions);
        });
    },

    /**
     * transactionController.show()
     */
    show: function (req, res) {
        var id = req.params.id;

        TransactionModel.findOne({_id: id}, function (err, transaction) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when getting transaction.',
                    error: err
                });
            }

            if (!transaction) {
                return res.status(404).json({
                    message: 'No such transaction'
                });
            }

            return res.json(transaction);
        });
    },

    /**
     * transactionController.create()
     */
    create: function (req, res) {
        var transaction = new TransactionModel({
			dateTime : req.body.dateTime,
			reference : req.body.reference,
			otherPartyString : req.body.otherPartyString,
			otherParty : req.body.otherParty,
			description : req.body.description,
			category : req.body.category,
			outgoing : req.body.outgoing,
			amount : req.body.amount,
			balance : req.body.balance
        });

        transaction.save(function (err, transaction) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when creating transaction',
                    error: err
                });
            }

            return res.status(201).json(transaction);
        });
    },

    /**
     * transactionController.update()
     */
    update: function (req, res) {
        var id = req.params.id;

        TransactionModel.findOne({_id: id}, function (err, transaction) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when getting transaction',
                    error: err
                });
            }

            if (!transaction) {
                return res.status(404).json({
                    message: 'No such transaction'
                });
            }

            transaction.dateTime = req.body.dateTime ? req.body.dateTime : transaction.dateTime;
			transaction.reference = req.body.reference ? req.body.reference : transaction.reference;
			transaction.otherPartyString = req.body.otherPartyString ? req.body.otherPartyString : transaction.otherPartyString;
			transaction.otherParty = req.body.otherParty ? req.body.otherParty : transaction.otherParty;
			transaction.description = req.body.description ? req.body.description : transaction.description;
			transaction.category = req.body.category ? req.body.category : transaction.category;
			transaction.outgoing = req.body.outgoing ? req.body.outgoing : transaction.outgoing;
			transaction.amount = req.body.amount ? req.body.amount : transaction.amount;
			transaction.balance = req.body.balance ? req.body.balance : transaction.balance;
			
            transaction.save(function (err, transaction) {
                if (err) {
                    return res.status(500).json({
                        message: 'Error when updating transaction.',
                        error: err
                    });
                }

                return res.json(transaction);
            });
        });
    },

    /**
     * transactionController.remove()
     */
    remove: function (req, res) {
        var id = req.params.id;

        TransactionModel.findByIdAndRemove(id, function (err, transaction) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when deleting the transaction.',
                    error: err
                });
            }

            return res.status(204).json();
        });
    }
};
