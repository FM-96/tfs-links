const express = require('express');

const requireAdmin = require('../../middleware/require_admin.js');

const controller = require('./api_admin.controller.js');

const router = express.Router();

router.post('/uploaders', requireAdmin(true), controller.createUploader);
router.delete('/uploaders/:id', requireAdmin(true), controller.deleteUploader);

router.get('/export/links', requireAdmin(true), controller.exportLinks);
router.post('/import/links', requireAdmin(true), controller.importLinks);

module.exports = router;
