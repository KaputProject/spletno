var express = require('express');
var router = express.Router();
var partyController = require('../controllers/partyController.js');

/*
 * GET
 */
router.get('/', partyController.list);

/*
 * GET
 */
router.get('/:id', partyController.show);

/*
 * POST
 */
router.post('/', partyController.create);

/*
 * PUT
 */
router.put('/:id', partyController.update);

/*
 * DELETE
 */
router.delete('/:id', partyController.remove);

module.exports = router;
