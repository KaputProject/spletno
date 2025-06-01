const express = require('express');
const router = express.Router();
const statementController = require('../controllers/statementController.js');
const authenticate = require('../middleware/authenticate.js');
const upload = require('../middleware/fileUpload');


module.exports = router;

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
router.post(
    '/upload',
    authenticate,
    (req, res, next) => {
        upload.single('file')(req, res, function (err) {
            if (err) {
                return res.status(400).json({ message: 'Napaka pri nalaganju datoteke', error: err.message });
            }
            next();
        });
    },
    statementController.upload
);


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
