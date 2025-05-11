var express = require('express');
var router = express.Router();
var statementController = require('../controllers/statementController.js');

/*
 * GET
 */
router.get('/', statementController.list);

/*
 * GET
 */
router.get('/:id', statementController.show);

/*
 * POST
 */
router.post('/', statementController.create);

/*
 * PUT
 */
router.put('/:id', statementController.update);

/*
 * DELETE
 */
router.delete('/:id', statementController.remove);

module.exports = router;
