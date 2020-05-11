const express = require('express');

const controller = require('./api_user.controller.js');

const router = express.Router();

router.get('/shows', controller.listShows);
router.get('/:show/videos', controller.listVideos);

module.exports = router;
