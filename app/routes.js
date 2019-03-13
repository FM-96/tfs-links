const express = require('express');

const path = require('path');

const oauth2Router = require('./oauth2/oauth2.router.js');

const router = express.Router();

router.get('/robots.txt', (req, res) => {
	res.contentType('txt').send('User-agent: *\nDisallow: /');
});

router.use('/assets', express.static(path.join(__dirname, 'public', 'assets'), {fallthrough: false}));

router.use(oauth2Router);

router.use(function (req, res) {
	res.sendStatus(404);
});

module.exports = router;
