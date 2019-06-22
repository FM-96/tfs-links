const express = require('express');

const requireAdmin = require('../middleware/require_admin.js');
const requireUploader = require('../middleware/require_uploader.js');

const apiController = require('./api.controller.js');

const router = express.Router();

router.use(requireAdmin());

router.post('/uploaders', requireAdmin(true), apiController.createUploader);
router.delete('/uploaders/:id', requireAdmin(true), apiController.deleteUploader);

router.post('/links', requireUploader(true), apiController.createLink);
router.delete('/links/:show/:episodes/:id', requireUploader(true), apiController.deleteLink);

router.get('/shows', apiController.listShows);
router.get('/:show/videos', apiController.listVideos);

router.get('/export/links', apiController.exportLinks);
router.post('/import/links', apiController.importLinks);

module.exports = router;
