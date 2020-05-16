const express = require('express');

const requireAdmin = require('../../middleware/require_admin.js');

const controller = require('./frontend_admin.controller.js');

const router = express.Router();

router.get('/actions/:page(\\d+|all)', requireAdmin(), controller.actionLogPage);
router.get('/admin', requireAdmin(), controller.adminPage);

module.exports = router;
