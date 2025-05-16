const express = require('express');
const router = express.Router();
const statementController = require('../controllers/statementController.js');
const authenticate = require('../middleware/authenticate.js');

/*
 * GET
 */
router.get('/', authenticate, statementController.list);

/*
 * GET
 */
router.get('/:id', authenticate, statementController.show);

/*
 * POST
 */
router.post('/', authenticate, statementController.create);

/*
 * POST
 */
router.post('/parse', authenticate, statementController.parse);

/*
 * PUT
 */
router.put('/:id', authenticate, statementController.update);

/*
 * DELETE
 */
router.delete('/:id', authenticate, statementController.remove);

module.exports = router;
