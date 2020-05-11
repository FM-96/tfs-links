const express = require('express');

const controller = require('./frontend_user.controller.js');

const router = express.Router();

router.get('/', controller.homePage);
router.get('/:show', controller.showPage);
router.get('/:show/:episodes', controller.videoPage);
router.get('/:show/:episodes/:link', controller.linkPage);

module.exports = router;
