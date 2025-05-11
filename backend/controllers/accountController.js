var AccountModel = require('../models/accountModel.js');

/**
 * accountController.js
 *
 * @description :: Server-side logic for managing accounts.
 */
module.exports = {

    /**
     * accountController.list()
     */
    list: function (req, res) {
        AccountModel.find(function (err, accounts) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when getting account.',
                    error: err
                });
            }

            return res.json(accounts);
        });
    },

    /**
     * accountController.show()
     */
    show: function (req, res) {
        var id = req.params.id;

        AccountModel.findOne({_id: id}, function (err, account) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when getting account.',
                    error: err
                });
            }

            if (!account) {
                return res.status(404).json({
                    message: 'No such account'
                });
            }

            return res.json(account);
        });
    },

    /**
     * accountController.create()
     */
    create: function (req, res) {
        var account = new AccountModel({
			iban : req.body.iban,
			balance : req.body.balance,
			statements : req.body.statements,
			stats : req.body.stats
        });

        account.save(function (err, account) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when creating account',
                    error: err
                });
            }

            return res.status(201).json(account);
        });
    },

    /**
     * accountController.update()
     */
    update: function (req, res) {
        var id = req.params.id;

        AccountModel.findOne({_id: id}, function (err, account) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when getting account',
                    error: err
                });
            }

            if (!account) {
                return res.status(404).json({
                    message: 'No such account'
                });
            }

            account.iban = req.body.iban ? req.body.iban : account.iban;
			account.balance = req.body.balance ? req.body.balance : account.balance;
			account.statements = req.body.statements ? req.body.statements : account.statements;
			account.stats = req.body.stats ? req.body.stats : account.stats;
			
            account.save(function (err, account) {
                if (err) {
                    return res.status(500).json({
                        message: 'Error when updating account.',
                        error: err
                    });
                }

                return res.json(account);
            });
        });
    },

    /**
     * accountController.remove()
     */
    remove: function (req, res) {
        var id = req.params.id;

        AccountModel.findByIdAndRemove(id, function (err, account) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when deleting the account.',
                    error: err
                });
            }

            return res.status(204).json();
        });
    }
};
