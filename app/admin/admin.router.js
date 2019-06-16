const express = require('express');

const requireAdmin = require('../middleware/require_admin.js');

const adminController = require('./admin.controller.js');

const router = express.Router();

router.get('/admin', requireAdmin(), adminController.handle);

module.exports = router;
