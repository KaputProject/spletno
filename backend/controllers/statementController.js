const StatementModel = require('../models/statementModel');
const AccountModel = require('../models/accountModel');
const { isOwner } = require('../utils/authorize');
const moment = require('moment');

module.exports = {

    /**
     * statementController.parse()
     *
     * @param req
     * @param res
     * @returns {Promise<*>}
     */
    parse: async (req, res) => {
        try {
            const account = await AccountModel.findOne({ iban: req.body.iban });
            if (!account) {
                return res.status(404).json({ message: `Account with IBAN: "${req.body.iban}" not found, please create it first.`});
            }

            const startDate = moment(req.body.startDate, 'DD.MM.YYYY').toDate();
            const endDate = moment(req.body.endDate, 'DD.MM.YYYY').toDate();

            const statement = new StatementModel({
                user: req.user._id,
                account: account._id,
                transactions: [],
                startDate: startDate,
                endDate: endDate,
                inflow: req.body.inflow || 0,
                outflow: req.body.outflow || 0,
                startBalance: req.body.startBalance || 0,
                endBalance: req.body.endBalance || 0,
                month: endDate.getMonth() + 1,
                year: endDate.getFullYear()
            });

            // TODO: Make sure only one transaction with the specific month, year and user can be created

            const saved = await statement.save();

            account.statements.push(saved._id);
            await account.save()

            res.status(201).json({
                message: 'Statement parsed successfully',
                statement: saved
            });

        } catch (err) {
            console.error('Error parsing statement:', err);
            res.status(500).json({
                message: 'Error when parsing statement',
                error: err
            });
        }
    },

    /**
     * statementController.list()
     *
     * @param req
     * @param res
     * @returns {Promise<void>}
     */
    list: async (req, res) => {
        try {
            const statements = await StatementModel.find({ user: req.user._id })
                .populate('user', '--password')
                .populate('account');

            res.json({
                message: 'Statements retrieved successfully',
                statements: statements
            });
        } catch (err) {
            console.error('Error retrieving statements:', err);
            res.status(500).json({
                message: 'Error when getting statements',
                error: err
            });
        }
    },

    /**
     * statementController.show()
     *
     * @param req
     * @param res
     * @returns {Promise<*>}
     */
    show: async (req, res) => {
        try {
            const statement = await StatementModel.findById(req.params.id)
                .populate('user', '--password')
                .populate('account')
                .populate('transactions');

            if (!statement) {
                return res.status(404).json({ message: 'Statement not found' });
            }

            if (!isOwner(statement, req.user)) {
                return res.status(403).json({ message: 'Forbidden: Not the statement owner' });
            }

            res.json({
                message: 'Statement details retrieved successfully',
                statement: statement
            });
        } catch (err) {
            console.error('Error retrieving statement:', err);
            res.status(500).json({
                message: 'Error when getting statement',
                error: err
            });
        }
    },

    /**
     * statementController.create()
     *
     * @param req
     * @param res
     * @returns {Promise<void>}
     */
    create: async (req, res) => {
        try {
            const statement = new StatementModel({
                user: req.user._id,
                account: req.body.account,
                transactions: req.body.transactions || [],
                startDate: req.body.startDate || new Date(),
                endDate: req.body.endDate || new Date(),
                inflow: req.body.inflow || 0,
                outflow: req.body.outflow || 0,
                startBalance: req.body.startBalance || 0,
                endBalance: req.body.endBalance || 0,
                month: req.body.month ?? new Date().getMonth(),
                year: req.body.year ?? new Date().getFullYear()
            });

            const saved = await statement.save();
            res.status(201).json({
                message: 'Statement saved successfully',
                statement: saved
            });
        } catch (err) {
            console.error('Error creating statement:', err);
            res.status(500).json({
                message: 'Error when creating statement',
                error: err
            });
        }
    },

    /**
     * statementController.update()
     *
     * @param req
     * @param res
     * @returns {Promise<*>}
     */
    update: async (req, res) => {
        try {
            const statement = await StatementModel.findById(req.params.id);
            if (!statement) {
                return res.status(404).json({ message: 'Statement not found' });
            }

            if (!isOwner(statement, req.user)) {
                return res.status(403).json({ message: 'Forbidden: Not the statement owner' });
            }

            statement.account = req.body.account ?? statement.account;
            statement.transactions = req.body.transactions ?? statement.transactions;
            statement.startDate = req.body.startDate ?? statement.startDate;
            statement.endDate = req.body.endDate ?? statement.endDate;
            statement.inflow = req.body.inflow ?? statement.inflow;
            statement.outflow = req.body.outflow ?? statement.outflow;
            statement.startBalance = req.body.startBalance ?? statement.startBalance;
            statement.endBalance = req.body.endBalance ?? statement.endBalance;
            statement.month = req.body.month ?? statement.month;
            statement.year = req.body.year ?? statement.year;

            const updated = await statement.save();
            res.json({
                message: 'Statement updated successfully',
                statement: updated
            });
        } catch (err) {
            console.log('Error updating statement:', err);
            res.status(500).json({
                message: 'Error when updating statement',
                error: err
            });
        }
    },

    /**
     * statementController.remove()
     *
     * @param req
     * @param res
     * @returns {Promise<*>}
     */
    remove: async (req, res) => {
        try {
            const statement = await StatementModel.findById(req.params.id);
            if (!statement) {
                return res.status(404).json({ message: 'Statement not found' });
            }

            if (!isOwner(statement, req.user)) {
                return res.status(403).json({ message: 'Forbidden: Not the statement owner' });
            }

            await statement.deleteOne();
            res.status(204).send();
        } catch (err) {
            console.error('Error deleting statement:', err);
            res.status(500).json({
                message: 'Error when deleting statement',
                error: err
            });
        }
    }
};
