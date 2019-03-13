const express = require('express');

const oauth2Controller = require('./oauth2.controller.js');

const router = express.Router();

router.route('/auth')
	.get(oauth2Controller.auth);

router.route('/login')
	.get(oauth2Controller.login);

module.exports = router;
