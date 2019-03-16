module.exports = function () {
	return preventRedundantLogin;
};

const logger = require('winston').loggers.get('default');

function preventRedundantLogin(req, res, next) {
	if (req.auth) {
		logger.debug('Already logged in, redirecting');

		let redirectTarget = '/';

		// ensure the redirect cannot lead to a different site
		if (typeof req.query.target === 'string' && /^\/[^/]/.test(req.query.target)) {
			redirectTarget = req.query.target;
		}

		res.redirect(redirectTarget);
		return;
	}
	next();
}
