const express = require('express');

const requireUploader = require('../../middleware/require_uploader.js');

const controller = require('./api_uploader.controller.js');

const router = express.Router();

router.post('/links', requireUploader(true), controller.createLink);
router.delete('/links/:show/:episodes/:id', requireUploader(true), controller.deleteLink);

router.delete('/:show', requireUploader(true), controller.deleteShow);
router.delete('/:show/:episodes', requireUploader(true), controller.deleteVideo);

module.exports = router;
