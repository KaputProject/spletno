var express = require('express');
var router = express.Router();
var transactionController = require('../controllers/transactionController.js');

/*
 * GET
 */
router.get('/', transactionController.list);

/*
 * GET
 */
router.get('/:id', transactionController.show);

/*
 * POST
 */
router.post('/', transactionController.create);

/*
 * PUT
 */
router.put('/:id', transactionController.update);

/*
 * DELETE
 */
router.delete('/:id', transactionController.remove);

module.exports = router;
