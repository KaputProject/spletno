const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController.js');
const authenticate = require('../middleware/authenticate.js');
const upload = require('../middleware/upload');

/*
 * GET
 */
router.get('/', authenticate, userController.list);

/*
 * GET
 */
router.get('/validate', authenticate, userController.validate);

/*
 * GET
 */
router.get('/:id/statistics', authenticate, userController.getUserStatistics);

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
router.put('/:id', authenticate, upload.single('avatar'), userController.update);

/*
 * DELETE
 */
router.delete('/:id', authenticate, userController.remove);

module.exports = router;
