const express = require('express');
const router = express.Router();
const locationController = require('../controllers/partnerController.js');
const authenticate = require('../middleware/authenticate.js');

/*
 * GET
 */
router.get('/', authenticate, locationController.list);

/*
 * GET
 */
router.get('/:id', authenticate, locationController.show);

/*
 * POST
 */
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
