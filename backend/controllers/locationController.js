const LocationModel = require('../models/locationModel.js');
const TransactionModel = require('../models/transactionModel.js');
const { isOwner } = require('../utils/authorize.js');

/**
 * locationController.js
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
            const locations = await LocationModel.find({ user: req.user._id })
                .populate('user')
                .populate('transactions');

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
     * partnerController.show()
     *
     * @param req
     * @param res
     * @returns {Promise<*>}
     */
    show: async (req, res) => {
        try {
            const partner = await LocationModel.findById(req.params.id)
                .populate({
                    path: 'transactions',
                    populate: {
                        path: 'account'
                    }
                });


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
            const partner = new LocationModel({
                user: req.user._id,
                name: req.body.name,
                identifier: req.body.identifier,
                description: req.body.description,
                total_spent: 0,
                total_received: 0,
                address: req.body.address,
                lat: req.body.lat,
                lng: req.body.lng,
                location: {
                    type: 'Point',
                    coordinates: [req.body.lng, req.body.lat]
                },
                icon: "default.png",
                tags: req.body.tags || [],
                transactions: []
            });

            const savedPartner = await partner.save();

            const unassociatedTransactions = await TransactionModel.find({
                user: req.user._id,
                location: null,
                original_location: savedPartner.identifier
            });

            const transactionIds = unassociatedTransactions.map(tx => tx._id);

            // Update each transaction's location
            await TransactionModel.updateMany(
                { _id: { $in: transactionIds } },
                { $set: { location: savedPartner._id } }
            );

            // Sum total_spent and total_received
            let totalSpent = 0;
            let totalReceived = 0;

            for (const tx of unassociatedTransactions) {
                if (tx.outgoing) {
                    totalSpent += tx.change;
                } else {
                    totalReceived += tx.change;
                }
            }

            // Assign the updated values and transactions to the saved partner
            savedPartner.transactions = transactionIds;
            savedPartner.total_spent = totalSpent;
            savedPartner.total_received = totalReceived;
            await savedPartner.save();

            req.user.locations.push(savedPartner._id);
            await req.user.save();

            res.status(201).json({
                message: 'Partner created successfully',
                partner: savedPartner
            });
        } catch (err) {
            console.log(err)
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
            const partner = await LocationModel.findById(req.params.id);

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
            const partner = await LocationModel.findById(req.params.id);

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

    findNearbyLocations: async (req, res) => {
        try {
            const { lng, lat, radius = 5000 } = req.query;

            if (!lng || !lat) {
                return res.status(400).json({ error: 'lat and lng are required' });
            }

            const userId = req.user._id;

            const nearbyLocations = await LocationModel.find({
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
                message: 'Nearby locations retrieved successfully',
                locations: nearbyLocations
            });
        } catch (err) {
            console.error(err);
            res.status(500).json({
                message: 'Error when getting nearby locations.',
                error: err
            });
        }
    },

    findLocationsInPolygon: async (req, res) => {
        try {
            const { points } = req.body;

            if (!points || !Array.isArray(points) || points.length !== 4) {
                return res.status(400).json({ error: 'Točno 4 točke (kot array koordinat) so zahtevane.' });
            }

            const userId = req.user._id;

            console.log('Received points:', points);

            // MongoDB pričakuje poligon, kjer je seznam koordinat sklenjen (prva točka == zadnja točka)
            const polygon = {
                type: 'Polygon',
                coordinates: [[
                    [parseFloat(points[0].lng), parseFloat(points[0].lat)],
                    [parseFloat(points[1].lng), parseFloat(points[1].lat)],
                    [parseFloat(points[2].lng), parseFloat(points[2].lat)],
                    [parseFloat(points[3].lng), parseFloat(points[3].lat)],
                    [parseFloat(points[0].lng), parseFloat(points[0].lat)] // zaključimo poligon
                ]]
            };

            console.log('Parsed polygon:', polygon);

            const locations = await LocationModel.find({
                user: userId,
                location: {
                    $geoWithin: {
                        $geometry: polygon
                    }
                }
            });

            res.json({
                message: 'Locations within polygon retrieved successfully',
                locations: locations
            });
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: 'Napaka pri geo poizvedbi s poligonom' });
        }
    }
};
