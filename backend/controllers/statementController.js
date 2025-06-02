const AccountModel = require('../models/accountModel');
const {isOwner} = require('../utils/authorize');
const moment = require('moment');
const StatementModel = require("../models/statementModel");
const transactionController = require('./transactionController');
const UserModel = require('../models/userModel');
const fs = require('fs');
const FormData = require('form-data');
const axios = require('axios');
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
            const account = await AccountModel.findOne({iban: req.body.iban});
            if (!account) {
                return res.status(404).json({message: `Account with IBAN: "${req.body.iban}" not found, please create it first.`});
            }

            let startDate, endDate;
            if (req.body.startDate && req.body.endDate) {
                const inputStart = moment(req.body.startDate, 'DD.MM.YYYY');
                const inputEnd = moment(req.body.endDate, 'DD.MM.YYYY');

                // Midpoint date
                const midDate = moment(inputStart.valueOf() + (inputEnd.valueOf() - inputStart.valueOf()) / 2);

                // First and last day of the month that midDate falls in
                startDate = midDate.clone().startOf('month').toDate();
                endDate = midDate.clone().endOf('month').toDate();
            } else {
                // Default to current month
                const now = moment();
                startDate = now.clone().startOf('month').toDate();
                endDate = now.clone().endOf('month').toDate();
            }

            const statement = new StatementModel({
                user: req.user._id,
                account: account._id,
                transactions: [],
                startDate,
                endDate,
                inflow: req.body.inflow || 0,
                outflow: req.body.outflow || 0,
                startBalance: req.body.startBalance || 0,
                endBalance: req.body.endBalance || 0
            });

            // TODO: enforce only one statement per user/month/year

            const saved = await statement.save();

            account.statements.push(saved._id);
            await account.save();

            res.status(201).json({
                message: 'Statement parsed successfully', statement: saved
            });

        } catch (err) {
            console.error('Error parsing statement:', err);
            res.status(500).json({
                message: 'Error when parsing statement', error: err
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
            const statements = await StatementModel.find({user: req.user._id})
                .populate('user', '--password')
                .populate('account');

            res.json({
                message: 'Statements retrieved successfully', statements: statements
            });
        } catch (err) {
            console.error('Error retrieving statements:', err);
            res.status(500).json({
                message: 'Error when getting statements', error: err
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
                .populate('user', '-password')
                .populate('account')
                .populate({
                    path: 'transactions', populate: {
                        path: 'location',
                    }
                });


            if (!statement) {
                return res.status(404).json({message: 'Statement not found'});
            }

            if (!isOwner(statement, req.user)) {
                return res.status(403).json({message: 'Forbidden: Not the statement owner'});
            }

            res.json({
                message: 'Statement details retrieved successfully', statement: statement
            });
        } catch (err) {
            console.error('Error retrieving statement:', err);
            res.status(500).json({
                message: 'Error when getting statement', error: err
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
            const {accountId, transactions, inflow, outflow, startBalance, endBalance, month, year} = req.body;

            const account = await AccountModel.findById(accountId);
            if (!account) {
                return res.status(404).json({message: `Account with ID: "${req.body.account}" not found, please create it first.`});
            }

            const startDate = new Date(year, month, 1);
            const endDate = new Date(year, month + 1, 0);

            const statement = new StatementModel({
                user: req.user._id,
                account,
                transactions: transactions || [],
                startDate,
                endDate,
                inflow: inflow || 0,
                outflow: outflow || 0,
                startBalance: startBalance || 0,
                endBalance: endBalance || 0,
                month,
                year
            });

            const saved = await statement.save();

            account.statements.push(saved._id);
            await account.save();

            res.status(201).json({
                message: 'Statement saved successfully', statement: saved
            });

        } catch (err) {
            console.error('Error creating statement:', err);
            res.status(500).json({
                message: 'Error when creating statement', error: err
            });
        }
    }, /**
     * Upload PDF datoteke in posredovanje na drug port/storitev
     */

    upload: async (req, res) => {
        try {
            console.log('Controller: datoteka =', req.file?.originalname);

            // Preveri, če je datoteka priložena
            if (!req.file) {
                return res.status(400).json({ message: 'Datoteka ni bila priložena' });
            }

            // Pridobi uporabnika in njegove lokacije
            const user = await UserModel.findById(req.user._id).populate('locations');
            if (!user) {
                return res.status(404).json({ message: 'Uporabnik ni najden' });
            }

            const fullName = user.identifier;
            const partnerIdentifiers = Array.isArray(user.locations)
                ? user.locations.map(loc => loc.identifier)
                : [];

            // Priprava podatkov za testni način
            const formData = new FormData();
            formData.append('file', fs.createReadStream(req.file.path), req.file.originalname);

            // Ročni vnosi za testiranje
            const manualName = 'KUDER LUKA';
            const manualMetadata = JSON.stringify([
                "LANA K.",
                "UNIFITNES, D.O.O.",
                "MDDSZ-DRZAVNE STIPENDIJE - ISCSD 2",
                "ASPIRIA d.o.o.",
                "HUMANITARNO DRUŠTVO LIONS KLUB KONJICE",
                "PayPal Europe S.a.r.l. et Cie S.C.A",
                "TELEKOM SLOVENIJE D.D."
            ]);

            formData.append('name', manualName);
            formData.append('metadata', manualMetadata);

            console.log('Pošiljam podatke na Kotlin server...');

            // Pošlji POST zahtevek na Kotlin server
            const response = await axios.post('http://localhost:5001/upload', formData, {
                headers: {
                    ...formData.getHeaders(),
                },
                timeout: 10000, // 10 sekundni timeout
            });

            console.log('Odgovor Kotlin strežnika:', response.data);

            const transactions = response.data.statement?.transactions || [];
            console.log('Prve 3 transakcije:', JSON.stringify(transactions.slice(0, 3), null, 2));

            // Po uspešnem pošiljanju izbriši lokalno datoteko
            try {
                await fs.promises.unlink(req.file.path);
                console.log('Začasna datoteka je bila uspešno izbrisana');
            } catch (unlinkErr) {
                console.error('Napaka pri brisanju začasne datoteke:', unlinkErr);
            }

            // Vrni uspešen odgovor
            res.status(200).json({
                message: 'Datoteka uspešno naložena in posredovana',
                data: response.data,
            });

        } catch (error) {
            // Obdelava napak
            if (error.response) {
                console.error('Napaka iz Kotlin serverja:', error.response.status, error.response.data);
            } else {
                console.error('Napaka pri nalaganju datoteke:', error.message);
            }

            res.status(500).json({
                message: 'Napaka pri nalaganju datoteke',
                error: error.message,
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
                return res.status(404).json({message: 'Statement not found'});
            }

            if (!isOwner(statement, req.user)) {
                return res.status(403).json({message: 'Forbidden: Not the statement owner'});
            }

            statement.account = req.body.account ?? statement.account;
            statement.transactions = req.body.transactions ?? statement.transactions;
            statement.startDate = req.body.startDate ?? statement.startDate;
            statement.endDate = req.body.endDate ?? statement.endDate;
            statement.inflow = req.body.inflow ?? statement.inflow;
            statement.outflow = req.body.outflow ?? statement.outflow;
            statement.startBalance = req.body.startBalance ?? statement.startBalance;
            statement.endBalance = req.body.endBalance ?? statement.endBalance;

            const updated = await statement.save();
            res.json({
                message: 'Statement updated successfully', statement: updated
            });
        } catch (err) {
            console.log('Error updating statement:', err);
            res.status(500).json({
                message: 'Error when updating statement', error: err
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
                return res.status(404).json({message: 'Statement not found'});
            }

            // Remove transactions using controller
            if (statement.transactions?.length > 0) {
                for (const transactionId of statement.transactions) {
                    req.params.id = transactionId;
                    await transactionController.remove(req, {
                        status: () => ({
                            json: () => {
                            }, send: () => {
                            }
                        }) // dummy res
                    });
                }
            }

            await statement.deleteOne();

            return res.status(200).json({message: 'Statement removed successfully'});
        } catch (err) {
            res.status(500).json({
                message: 'Error when deleting statement', error: err
            });
        }
    },
};
