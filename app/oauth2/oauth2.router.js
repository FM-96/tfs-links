const express = require('express');

const oauth2Controller = require('./oauth2.controller.js');
const preventRedundantLogin = require('../middleware/prevent_redundant_login.js');

const router = express.Router();

router.route('/auth')
	.all(preventRedundantLogin())
	.get(oauth2Controller.auth);

router.route('/login')
	.all(preventRedundantLogin())
	.get(oauth2Controller.login);

router.route('/logout')
	.get(oauth2Controller.logout);

module.exports = router;
