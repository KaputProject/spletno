var express = require('express');
var router = express.Router();
var entityController = require('../controllers/entityController.js');

/*
 * GET
 */
router.get('/', entityController.list);

/*
 * GET
 */
router.get('/:id', entityController.show);

/*
 * POST
 */
router.post('/', entityController.create);

/*
 * PUT
 */
router.put('/:id', entityController.update);

/*
 * DELETE
 */
router.delete('/:id', entityController.remove);

module.exports = router;
