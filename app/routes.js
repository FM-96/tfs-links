const express = require('express');
const logger = require('winston').loggers.get('default');

const path = require('path');

const processJwt = require('./middleware/process_JWT.js');
const requireLogin = require('./middleware/require_login.js');

const adminRouter = require('./admin/admin.router.js');
const apiRouter = require('./api/api.router.js');
const oauth2Router = require('./oauth2/oauth2.router.js');
const uploaderRouter = require('./uploader/uploader.router.js');
const userRouter = require('./user/user.router.js');

const router = express.Router();

router.get('/robots.txt', (req, res) => {
	res.contentType('txt').send('User-agent: *\nDisallow: /');
});

router.use('/assets', express.static(path.join(__dirname, '..', 'public', 'assets'), {fallthrough: false}));

router.use(processJwt());
router.use(oauth2Router);
router.use(requireLogin());

router.use('/api', apiRouter);

router.use(adminRouter);
router.use(uploaderRouter);
router.use(userRouter);

router.use(function (req, res) {
	logger.debug(`404: ${req.originalUrl}`);
	res.status(404).render('not_found');
});

router.use(function (err, req, res, next) {
	logger.error('Unhandled error:');
	logger.error(err);
	res.status(500).render('error');
});

module.exports = router;
