const {apiResultError} = require('../../utils/apiResults.js');

module.exports = function (isApiCall) {
	function requireAdmin(req, res, next) {
		if (!req.auth.isAdmin) {
			// TODO WWW-Authenticate header
			res.status(401);

			if (isApiCall) {
				res.send(apiResultError('must be admin'));
			} else {
				res.render('unauthorized', {
					redirectTarget: encodeURIComponent(req.originalUrl),
				});
			}
			return;
		}
		next();
	}

	return requireAdmin;
};
