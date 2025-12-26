const express = require('express');
const router = express.Router();
const familyController = require('../controllers/familyController.js');
const authenticate = require('../middleware/authenticate.js');

/*
 * GET
 */
router.get('/', authenticate, familyController.get);

/*
 * POST
 */
router.post('/', authenticate, familyController.create);

/*
 * PUT
 */
router.put('/:id', authenticate, familyController.addUser);

/*
 * GET
 */
router.get('/:id/statistics', authenticate, familyController.getStatistics);

module.exports = router;
