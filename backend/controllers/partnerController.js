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

            res.json({
                message: 'Partner details retrieved successfully',
                partner: partner
            });
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
                location: {
                    type: 'Point',
                    coordinates: [req.body.lng, req.body.lat]
                },

                // TODO: Make a default icon
                icon: "default.png",
                tags: req.body.tags || []
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
            partner.tags = req.body.tags ?? partner.tags;

            if (req.body.lat != null && req.body.lng != null) {
                partner.location = {
                    type: 'Point',
                    coordinates: [req.body.lng, req.body.lat]
                };
            }

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
    },

    findNearbyPartners: async (req, res) => {
        try {
            const { lng, lat, radius = 5000 } = req.query;

            if (!lng || !lat) {
                return res.status(400).json({ error: 'lat and lng are required' });
            }

            const userId = req.user._id;

            const nearbyPartners = await PartnerModel.find({
                user: userId,
                location: {
                    $near: {
                        $geometry: {
                            type: 'Point',
                            coordinates: [parseFloat(lng), parseFloat(lat)]
                        },
                        $maxDistance: parseFloat(radius)
                    }
                }
            });

            res.json({
                message: 'Nearby partners retrieved successfully',
                partners: nearbyPartners
            });
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: 'Napaka pri geo poizvedbi' });
        }
    }
};
