const LocationModel = require('../models/locationModel.js');
const { isOwner } = require('../utils/authorize.js');

/**
 * locationController.js
 *
 * @description :: Server-side logic for managing locations.
 */
module.exports = {

    /**
     * locationController.list()
     *
     * @param req
     * @param res
     * @returns {Promise<void>}
     */
    list: async (req, res) => {
        try {
            const locations = await LocationModel.find({ user: req.user._id }).populate('user');

            res.json({
                message: 'User locations retrieved successfully',
                locations
            });
        } catch (err) {
            res.status(500).json({
                message: 'Error when getting user locations.',
                error: err
            });
        }
    },

    /**
     * locationController.show()
     *
     * @param req
     * @param res
     * @returns {Promise<*>}
     */
    show: async (req, res) => {
        try {
            const location = await LocationModel.findById(req.params.id);

            if (!location) {
                return res.status(404).json({ message: 'No such location' });
            }

            if (!isOwner(location, req.user)) {
                return res.status(403).json({ message: 'Unauthorized access' });
            }

            res.json(location);
        } catch (err) {
            res.status(500).json({
                message: 'Error when getting location.',
                error: err
            });
        }
    },

    /**
     * locationController.create()
     *
     * @param req
     * @param res
     * @returns {Promise<void>}
     */
    create: async (req, res) => {
        try {
            const location = new LocationModel({
                user: req.user._id,
                name: req.body.name,
                identifier: req.body.identifier,
                description: req.body.description,
                total_spent: 0,
                address: req.body.address,
                lat: req.body.lat,
                lng: req.body.lng,

                // TODO: Make a default icon
                icon: "default.png",
                types: req.body.types
            });

            const savedLocation = await location.save();

            // Here the location is saved to the users table of locations
            req.user.locations.push(savedLocation._id);
            await req.user.save();

            res.status(201).json({
                message: 'Location created successfully',
                location: savedLocation
            });
        } catch (err) {
            res.status(500).json({
                message: 'Error when creating location.',
                error: err
            });
        }
    },

    /**
     * locationController.update()
     *
     * @param req
     * @param res
     * @returns {Promise<*>}
     */
    update: async (req, res) => {
        try {
            const location = await LocationModel.findById(req.params.id);

            if (!location) {
                return res.status(404).json({ message: 'No such location' });
            }

            if (!isOwner(location, req.user)) {
                return res.status(403).json({ message: 'Unauthorized access' });
            }

            location.name = req.body.name ?? location.name;
            location.identifier = req.body.identifier ?? location.identifier;
            location.description = req.body.description ?? location.description;
            location.address = req.body.address ?? location.address;
            location.lat = req.body.lat ?? location.lat;
            location.lng = req.body.lng ?? location.lng;
            location.types = req.body.types ?? location.types;

            const updatedLocation = await location.save();

            res.json({
                message: 'Location updated successfully',
                location: updatedLocation
            });
        } catch (err) {
            res.status(500).json({
                message: 'Error when updating location.',
                error: err
            });
        }
    },

    /**
     * locationController.remove()
     *
     * @param req
     * @param res
     * @returns {Promise<*>}
     */
    remove: async (req, res) => {
        try {
            const location = await LocationModel.findById(req.params.id);

            if (!location) {
                return res.status(404).json({ message: 'No such location' });
            }

            if (!isOwner(location, req.user)) {
                return res.status(403).json({ message: 'Unauthorized access' });
            }

            await location.deleteOne();

            res.status(204).json();
        } catch (err) {
            res.status(500).json({
                message: 'Error when deleting location.',
                error: err
            });
        }
    }
};
