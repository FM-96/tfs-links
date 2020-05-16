const express = require('express');

const requireUploader = require('../../middleware/require_uploader.js');

const controller = require('./frontend_uploader.controller.js');

const router = express.Router();

router.get('/uploader', requireUploader(), controller.handle);

module.exports = router;
