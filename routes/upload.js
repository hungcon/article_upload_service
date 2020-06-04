const router = require('express').Router();
const asyncMiddleware = require('../middlewares/async');
const uploadController = require('../controllers/upload');

/* eslint-disable prettier/prettier */
router.post('/uploads/file', asyncMiddleware(uploadController.uploadFile));
router.post('/uploads/url', asyncMiddleware(uploadController.uploadUrl));
/* eslint-enable prettier/prettier */

module.exports = router;
