const PartnerModel = require('../models/partnerModel.js');
const { isOwner } = require('../utils/authorize.js');

/**
 * partnerController.js
 *
 * @description :: Server-side logic for managing locations.
 */
module.exports = {
    /**
     * partnerController.list()
     *
     * @param req
     * @param res
     * @returns {Promise<void>}
     */
    list: async (req, res) => {
        try {
            const partners = await PartnerModel.find({ user: req.user._id }).populate('user');

            res.json({
                message: 'User partners retrieved successfully',
                partners
            });
        } catch (err) {
            res.status(500).json({
                message: 'Error when getting user partners.',
                error: err
            });
        }
    },

    /**
     * partnerController.show()
     *
     * @param req
     * @param res
     * @returns {Promise<*>}
     */
    show: async (req, res) => {
        try {
            const partner = await PartnerModel.findById(req.params.id);

            if (!partner) {
                return res.status(404).json({ message: 'No such partner' });
            }

            if (!isOwner(partner, req.user)) {
                return res.status(403).json({ message: 'Unauthorized access' });
            }

            res.json(partner);
        } catch (err) {
            res.status(500).json({
                message: 'Error when getting partner.',
                error: err
            });
        }
    },

    /**
     * partnerController.create()
     *
     * @param req
     * @param res
     * @returns {Promise<void>}
     */
    create: async (req, res) => {
        try {
            const partner = new PartnerModel({
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
                types: req.body.types || []
            });

            const savedPartner = await partner.save();

            // Here the partner is saved to the users table of partners
            req.user.partners.push(savedPartner._id);
            await req.user.save();

            res.status(201).json({
                message: 'Partner created successfully',
                partner: savedPartner
            });
        } catch (err) {
            res.status(500).json({
                message: 'Error when creating partner.',
                error: err
            });
        }
    },

    /**
     * partnerController.update()
     *
     * @param req
     * @param res
     * @returns {Promise<*>}
     */
    update: async (req, res) => {
        try {
            const partner = await PartnerModel.findById(req.params.id);

            if (!partner) {
                return res.status(404).json({ message: 'No such partner' });
            }

            if (!isOwner(partner, req.user)) {
                return res.status(403).json({ message: 'Unauthorized access' });
            }

            partner.name = req.body.name ?? partner.name;
            partner.identifier = req.body.identifier ?? partner.identifier;
            partner.description = req.body.description ?? partner.description;
            partner.address = req.body.address ?? partner.address;
            partner.lat = req.body.lat ?? partner.lat;
            partner.lng = req.body.lng ?? partner.lng;
            partner.types = req.body.types ?? partner.types;

            const updatedPartner = await partner.save();

            res.json({
                message: 'Partner updated successfully',
                partner: updatedPartner
            });
        } catch (err) {
            res.status(500).json({
                message: 'Error when updating partner.',
                error: err
            });
        }
    },

    /**
     * partnerController.remove()
     *
     * @param req
     * @param res
     * @returns {Promise<*>}
     */
    remove: async (req, res) => {
        try {
            const partner = await PartnerModel.findById(req.params.id);

            if (!partner) {
                return res.status(404).json({ message: 'No such partner' });
            }

            await partner.deleteOne();

            return res.status(200).json({ message: 'Partner removed successfully' });

        } catch (err) {
            res.status(500).json({
                message: 'Error when deleting partner.',
                error: err
            });
        }
    }

};
