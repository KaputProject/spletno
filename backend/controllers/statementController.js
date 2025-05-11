var StatementModel = require('../models/statementModel.js');

/**
 * statementController.js
 *
 * @description :: Server-side logic for managing statements.
 */
module.exports = {

    /**
     * statementController.list()
     */
    list: function (req, res) {
        StatementModel.find(function (err, statements) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when getting statement.',
                    error: err
                });
            }

            return res.json(statements);
        });
    },

    /**
     * statementController.show()
     */
    show: function (req, res) {
        var id = req.params.id;

        StatementModel.findOne({_id: id}, function (err, statement) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when getting statement.',
                    error: err
                });
            }

            if (!statement) {
                return res.status(404).json({
                    message: 'No such statement'
                });
            }

            return res.json(statement);
        });
    },

    /**
     * statementController.create()
     */
    create: function (req, res) {
        var statement = new StatementModel({
			transactions : req.body.transactions,
			user : req.body.user,
			account : req.body.account,
			description : req.body.description,
			totalIn : req.body.totalIn,
			totalOut : req.body.totalOut,
			balanceBefore : req.body.balanceBefore,
			balanceAfter : req.body.balanceAfter,
			stats : req.body.stats,
			dateTime : req.body.dateTime
        });

        statement.save(function (err, statement) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when creating statement',
                    error: err
                });
            }

            return res.status(201).json(statement);
        });
    },

    /**
     * statementController.update()
     */
    update: function (req, res) {
        var id = req.params.id;

        StatementModel.findOne({_id: id}, function (err, statement) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when getting statement',
                    error: err
                });
            }

            if (!statement) {
                return res.status(404).json({
                    message: 'No such statement'
                });
            }

            statement.transactions = req.body.transactions ? req.body.transactions : statement.transactions;
			statement.user = req.body.user ? req.body.user : statement.user;
			statement.account = req.body.account ? req.body.account : statement.account;
			statement.description = req.body.description ? req.body.description : statement.description;
			statement.totalIn = req.body.totalIn ? req.body.totalIn : statement.totalIn;
			statement.totalOut = req.body.totalOut ? req.body.totalOut : statement.totalOut;
			statement.balanceBefore = req.body.balanceBefore ? req.body.balanceBefore : statement.balanceBefore;
			statement.balanceAfter = req.body.balanceAfter ? req.body.balanceAfter : statement.balanceAfter;
			statement.stats = req.body.stats ? req.body.stats : statement.stats;
			statement.dateTime = req.body.dateTime ? req.body.dateTime : statement.dateTime;
			
            statement.save(function (err, statement) {
                if (err) {
                    return res.status(500).json({
                        message: 'Error when updating statement.',
                        error: err
                    });
                }

                return res.json(statement);
            });
        });
    },

    /**
     * statementController.remove()
     */
    remove: function (req, res) {
        var id = req.params.id;

        StatementModel.findByIdAndRemove(id, function (err, statement) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when deleting the statement.',
                    error: err
                });
            }

            return res.status(204).json();
        });
    }
};
