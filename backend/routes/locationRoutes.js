const express = require('express');
const router = express.Router();
const locationController = require('../controllers/locationController.js');
const authenticate = require('../middleware/authenticate.js');

/*
 * GET
 */
router.get('/nearby', authenticate, locationController.findNearbyLocations);

router.get('/', authenticate, locationController.list);

/*
 * GET
 */

router.get('/:id', authenticate, locationController.show);

/*
 * POST
 */
router.post('/polygon', authenticate, locationController.findLocationsInPolygon);

router.post('/', authenticate, locationController.create);

/*
 * PUT
 */
router.put('/:id', authenticate, locationController.update);

/*
 * DELETE
 */
router.delete('/:id', authenticate, locationController.remove);

module.exports = router;
