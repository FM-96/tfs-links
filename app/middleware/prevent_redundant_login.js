module.exports = function () {
	return preventRedundantLogin;
};

function preventRedundantLogin(req, res, next) {
	if (req.auth) {
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
