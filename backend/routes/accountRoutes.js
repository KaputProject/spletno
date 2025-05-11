var express = require('express');
var router = express.Router();
var accountController = require('../controllers/accountController.js');

/*
 * GET
 */
router.get('/', accountController.list);

/*
 * GET
 */
router.get('/:id', accountController.show);

/*
 * POST
 */
router.post('/', accountController.create);

/*
 * PUT
 */
router.put('/:id', accountController.update);

/*
 * DELETE
 */
router.delete('/:id', accountController.remove);

module.exports = router;
