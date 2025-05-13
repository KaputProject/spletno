var express = require('express');
var router = express.Router();
var userController = require('../controllers/userController.js');
const authenticate = require('../middlewares/authenticate.js');

/*
 * GET
 */
router.get('/', authenticate, userController.list);

/*
 * GET
 */
router.get('/:id', authenticate, userController.show);

/*
 * POST
 */
router.post('/login', userController.login);

/*
 * POST
 */
router.post('/', userController.create);

/*
 * PUT
 */
router.put('/:id', authenticate, userController.update);

/*
 * DELETE
 */
router.delete('/:id', authenticate, userController.remove);

module.exports = router;
