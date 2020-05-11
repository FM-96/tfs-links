const express = require('express');

const controller = require('./api_admin.controller.js');

const router = express.Router();

router.post('/uploaders', controller.createUploader);
router.delete('/uploaders/:id', controller.deleteUploader);

router.get('/export/links', controller.exportLinks);
router.post('/import/links', controller.importLinks);

module.exports = router;
