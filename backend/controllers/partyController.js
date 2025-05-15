var PartyModel = require('../models/partyModel.js');

/**
 * partyController.js
 *
 * @description :: Server-side logic for managing partys.
 */
module.exports = {

    /**
     * partyController.list()
     */
    list: function (req, res) {
        PartyModel.find(function (err, partys) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when getting party.',
                    error: err
                });
            }

            return res.json(partys);
        });
    },

    /**
     * partyController.show()
     */
    show: function (req, res) {
        var id = req.params.id;

        PartyModel.findOne({_id: id}, function (err, party) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when getting party.',
                    error: err
                });
            }

            if (!party) {
                return res.status(404).json({
                    message: 'No such party'
                });
            }

            return res.json(party);
        });
    },

    /**
     * partyController.create()
     */
    create: function (req, res) {
        var party = new PartyModel({
			name : req.body.name
        });

        party.save(function (err, party) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when creating party',
                    error: err
                });
            }

            return res.status(201).json(party);
        });
    },

    /**
     * partyController.update()
     */
    update: function (req, res) {
        var id = req.params.id;

        PartyModel.findOne({_id: id}, function (err, party) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when getting party',
                    error: err
                });
            }

            if (!party) {
                return res.status(404).json({
                    message: 'No such party'
                });
            }

            party.name = req.body.name ? req.body.name : party.name;
			
            party.save(function (err, party) {
                if (err) {
                    return res.status(500).json({
                        message: 'Error when updating party.',
                        error: err
                    });
                }

                return res.json(party);
            });
        });
    },

    /**
     * partyController.remove()
     */
    remove: function (req, res) {
        var id = req.params.id;

        PartyModel.findByIdAndRemove(id, function (err, party) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when deleting the party.',
                    error: err
                });
            }

            return res.status(204).json();
        });
    }
};
