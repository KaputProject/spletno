const express = require('express');
const router = express.Router();
const accountController = require('../controllers/accountController.js');
const authenticate = require('../middleware/authenticate.js');

/*
 * GET
 */
router.get('/', authenticate, accountController.list);

/*
 * GET
 */
router.get('/:id', authenticate, accountController.show);

/*
 * POST
 */
router.post('/', authenticate, accountController.create);

/*
 * PUT
 */
router.put('/:id', authenticate, accountController.update);

/*
 * DELETE
 */
router.delete('/:id', authenticate, accountController.remove);

module.exports = router;
