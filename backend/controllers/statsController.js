var StatsModel = require('../models/statsModel.js');

/**
 * statsController.js
 *
 * @description :: Server-side logic for managing statss.
 */
module.exports = {

    /**
     * statsController.list()
     */
    list: function (req, res) {
        StatsModel.find(function (err, statss) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when getting stats.',
                    error: err
                });
            }

            return res.json(statss);
        });
    },

    /**
     * statsController.show()
     */
    show: function (req, res) {
        var id = req.params.id;

        StatsModel.findOne({_id: id}, function (err, stats) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when getting stats.',
                    error: err
                });
            }

            if (!stats) {
                return res.status(404).json({
                    message: 'No such stats'
                });
            }

            return res.json(stats);
        });
    },

    /**
     * statsController.create()
     */
    create: function (req, res) {
        var stats = new StatsModel({
			stat : req.body.stat
        });

        stats.save(function (err, stats) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when creating stats',
                    error: err
                });
            }

            return res.status(201).json(stats);
        });
    },

    /**
     * statsController.update()
     */
    update: function (req, res) {
        var id = req.params.id;

        StatsModel.findOne({_id: id}, function (err, stats) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when getting stats',
                    error: err
                });
            }

            if (!stats) {
                return res.status(404).json({
                    message: 'No such stats'
                });
            }

            stats.stat = req.body.stat ? req.body.stat : stats.stat;
			
            stats.save(function (err, stats) {
                if (err) {
                    return res.status(500).json({
                        message: 'Error when updating stats.',
                        error: err
                    });
                }

                return res.json(stats);
            });
        });
    },

    /**
     * statsController.remove()
     */
    remove: function (req, res) {
        var id = req.params.id;

        StatsModel.findByIdAndRemove(id, function (err, stats) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when deleting the stats.',
                    error: err
                });
            }

            return res.status(204).json();
        });
    }
};
