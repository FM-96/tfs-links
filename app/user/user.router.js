const express = require('express');

const userController = require('./user.controller.js');

const router = express.Router();

router.get('/', userController.homePage);
router.get('/:show', userController.showPage);
router.get('/:show/:episodes', userController.videoPage);
router.get('/:show/:episodes/:link', userController.linkPage);

module.exports = router;
