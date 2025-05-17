const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactionController.js');
const authenticate = require('../middleware/authenticate.js');

/*
 * GET
 */
router.get('/', authenticate, transactionController.list);

/*
 * GET
 */
router.get('/:id', authenticate, transactionController.show);

/*
 * POST
 */
router.post('/', authenticate, transactionController.create);

/*
 * POST
 */
router.post('/parse', authenticate, transactionController.parse);

/*
 * PUT
 */
router.put('/:id', authenticate, transactionController.update);

/*
 * DELETE
 */
router.delete('/:id', authenticate, transactionController.remove);

module.exports = router;
