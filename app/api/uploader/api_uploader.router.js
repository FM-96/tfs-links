const express = require('express');

const controller = require('./api_uploader.controller.js');

const router = express.Router();

router.post('/links', controller.createLink);
router.delete('/links/:show/:episodes/:id', controller.deleteLink);

router.delete('/:show', controller.deleteShow);
router.delete('/:show/:episodes', controller.deleteVideo);

module.exports = router;
