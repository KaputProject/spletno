var EntityModel = require('../models/entityModel.js');

/**
 * entityController.js
 *
 * @description :: Server-side logic for managing entitys.
 */
module.exports = {

    /**
     * entityController.list()
     */
    list: function (req, res) {
        EntityModel.find(function (err, entitys) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when getting entity.',
                    error: err
                });
            }

            return res.json(entitys);
        });
    },

    /**
     * entityController.show()
     */
    show: function (req, res) {
        var id = req.params.id;

        EntityModel.findOne({_id: id}, function (err, entity) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when getting entity.',
                    error: err
                });
            }

            if (!entity) {
                return res.status(404).json({
                    message: 'No such entity'
                });
            }

            return res.json(entity);
        });
    },

    /**
     * entityController.create()
     */
    create: function (req, res) {
        var entity = new EntityModel({
			name : req.body.name,
			type : req.body.type,
			address : req.body.address,
			company : req.body.company
        });

        entity.save(function (err, entity) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when creating entity',
                    error: err
                });
            }

            return res.status(201).json(entity);
        });
    },

    /**
     * entityController.update()
     */
    update: function (req, res) {
        var id = req.params.id;

        EntityModel.findOne({_id: id}, function (err, entity) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when getting entity',
                    error: err
                });
            }

            if (!entity) {
                return res.status(404).json({
                    message: 'No such entity'
                });
            }

            entity.name = req.body.name ? req.body.name : entity.name;
			entity.type = req.body.type ? req.body.type : entity.type;
			entity.address = req.body.address ? req.body.address : entity.address;
			entity.company = req.body.company ? req.body.company : entity.company;
			
            entity.save(function (err, entity) {
                if (err) {
                    return res.status(500).json({
                        message: 'Error when updating entity.',
                        error: err
                    });
                }

                return res.json(entity);
            });
        });
    },

    /**
     * entityController.remove()
     */
    remove: function (req, res) {
        var id = req.params.id;

        EntityModel.findByIdAndRemove(id, function (err, entity) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when deleting the entity.',
                    error: err
                });
            }

            return res.status(204).json();
        });
    }
};
