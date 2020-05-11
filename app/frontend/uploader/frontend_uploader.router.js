const express = require('express');

const controller = require('./frontend_uploader.controller.js');

const router = express.Router();

router.get('/uploader', controller.handle);

module.exports = router;
