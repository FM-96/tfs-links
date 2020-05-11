const express = require('express');

const controller = require('./frontend_admin.controller.js');

const router = express.Router();

router.get('/actions/:page(\\d+|all)', controller.actionLogPage);
router.get('/admin', controller.adminPage);

module.exports = router;
