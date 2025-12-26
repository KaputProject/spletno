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
//
// /*
//  * PUT
//  */
// router.put('/', authenticate, familyController.addUser);
//
// /*
//  * DELETE
//  */
// router.delete('/', authenticate, familyController.remove);

module.exports = router;
