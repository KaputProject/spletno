var AddressModel = require('../models/addressModel.js');

/**
 * addressController.js
 *
 * @description :: Server-side logic for managing addresss.
 */
module.exports = {

    /**
     * addressController.list()
     */
    list: function (req, res) {
        AddressModel.find(function (err, addresss) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when getting address.',
                    error: err
                });
            }

            return res.json(addresss);
        });
    },

    /**
     * addressController.show()
     */
    show: function (req, res) {
        var id = req.params.id;

        AddressModel.findOne({_id: id}, function (err, address) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when getting address.',
                    error: err
                });
            }

            if (!address) {
                return res.status(404).json({
                    message: 'No such address'
                });
            }

            return res.json(address);
        });
    },

    /**
     * addressController.create()
     */
    create: function (req, res) {
        var address = new AddressModel({
			addressLine1 : req.body.addressLine1,
			addressLine2 : req.body.addressLine2,
			city : req.body.city,
			code : req.body.code,
			state : req.body.state,
			country : req.body.country
        });

        address.save(function (err, address) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when creating address',
                    error: err
                });
            }

            return res.status(201).json(address);
        });
    },

    /**
     * addressController.update()
     */
    update: function (req, res) {
        var id = req.params.id;

        AddressModel.findOne({_id: id}, function (err, address) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when getting address',
                    error: err
                });
            }

            if (!address) {
                return res.status(404).json({
                    message: 'No such address'
                });
            }

            address.addressLine1 = req.body.addressLine1 ? req.body.addressLine1 : address.addressLine1;
			address.addressLine2 = req.body.addressLine2 ? req.body.addressLine2 : address.addressLine2;
			address.city = req.body.city ? req.body.city : address.city;
			address.code = req.body.code ? req.body.code : address.code;
			address.state = req.body.state ? req.body.state : address.state;
			address.country = req.body.country ? req.body.country : address.country;
			
            address.save(function (err, address) {
                if (err) {
                    return res.status(500).json({
                        message: 'Error when updating address.',
                        error: err
                    });
                }

                return res.json(address);
            });
        });
    },

    /**
     * addressController.remove()
     */
    remove: function (req, res) {
        var id = req.params.id;

        AddressModel.findByIdAndRemove(id, function (err, address) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when deleting the address.',
                    error: err
                });
            }

            return res.status(204).json();
        });
    }
};
