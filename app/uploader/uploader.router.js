const express = require('express');

const requireUploader = require('../middleware/require_uploader.js');

const uploaderController = require('./uploader.controller.js');

const router = express.Router();

router.get('/uploader', requireUploader(), uploaderController.handle);

module.exports = router;
