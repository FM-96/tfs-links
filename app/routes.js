const express = require('express');
const logger = require('winston').loggers.get('default');

const path = require('path');

const version = require('../utils/version.js');

const processJwt = require('./middleware/process_JWT.js');
const requireLogin = require('./middleware/require_login.js');

const apiAdminRouter = require('./api/admin/api_admin.router.js');
const apiUploaderRouter = require('./api/uploader/api_uploader.router.js');
const apiUserRouter = require('./api/user/api_user.router.js');
const frontendAdminRouter = require('./frontend/admin/frontend_admin.router.js');
const frontendUploaderRouter = require('./frontend/uploader/frontend_uploader.router.js');
const frontendUserRouter = require('./frontend/user/frontend_user.router.js');
const oauth2Router = require('./oauth2/oauth2.router.js');

const router = express.Router();

router.get('/robots.txt', (req, res) => {
	res.contentType('txt').send('User-agent: *\nDisallow: /');
});

router.use('/assets', express.static(path.join(__dirname, '..', 'public', 'assets'), {fallthrough: false}));

router.use(processJwt());
router.use(oauth2Router);
router.use(requireLogin());

router.use('/api', apiAdminRouter);
router.use('/api', apiUploaderRouter);
router.use('/api', apiUserRouter);

router.use(frontendAdminRouter);
router.use(frontendUploaderRouter);
router.use(frontendUserRouter);

router.use(function (req, res) {
	const pugData = {
		auth: req.auth,
		version,
	};
	logger.debug(`404: ${req.originalUrl}`);
	res.status(404).render('not_found', pugData);
});

router.use(function (err, req, res, next) {
	const pugData = {
		auth: req.auth,
		version,
	};
	logger.error('Unhandled error:');
	logger.error(err);
	res.status(500).render('error', pugData);
});

module.exports = router;
