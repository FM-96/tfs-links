const {apiResultError} = require('../../utils/api_results.js');
const version = require('../../utils/version.js');

module.exports = function (isApiCall) {
	function requireAdmin(req, res, next) {
		const pugData = {
			auth: req.auth,
			version,
		};
		if (!req.auth.isAdmin) {
			// TODO WWW-Authenticate header
			res.status(401);

			if (isApiCall) {
				res.send(apiResultError('must be admin'));
			} else {
				res.render('unauthorized', pugData);
			}
			return;
		}
		next();
	}

	return requireAdmin;
};
