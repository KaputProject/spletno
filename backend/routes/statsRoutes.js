var express = require('express');
var router = express.Router();
var statsController = require('../controllers/statsController.js');

/*
 * GET
 */
router.get('/', statsController.list);

/*
 * GET
 */
router.get('/:id', statsController.show);

/*
 * POST
 */
router.post('/', statsController.create);

/*
 * PUT
 */
router.put('/:id', statsController.update);

/*
 * DELETE
 */
router.delete('/:id', statsController.remove);

module.exports = router;
