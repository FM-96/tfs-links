const express = require('express');

const requireAdmin = require('../middleware/require_admin.js');
const requireUploader = require('../middleware/require_uploader.js');

const apiController = require('./api.controller.js');

const router = express.Router();

router.post('/uploaders', requireAdmin(true), apiController.createUploader);
router.delete('/uploaders/:id', requireAdmin(true), apiController.deleteUploader);

router.post('/links', requireUploader(true), apiController.createLink);
router.delete('/links/:show/:episodes/:id', requireUploader(true), apiController.deleteLink);

router.get('/shows', apiController.listShows);
router.get('/:show/videos', apiController.listVideos);

router.get('/export/links', requireAdmin(true), apiController.exportLinks);
router.post('/import/links', requireAdmin(true), apiController.importLinks);

router.delete('/:show', requireUploader(true), apiController.deleteShow);
router.delete('/:show/:episodes', requireUploader(true), apiController.deleteVideo);

module.exports = router;
