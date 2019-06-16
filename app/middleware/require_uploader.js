const {apiResultError} = require('../../utils/apiResults.js');

module.exports = function (isApiCall) {
	function requireUploader(req, res, next) {
		if (!req.auth.isUploader) {
			// TODO WWW-Authenticate header
			res.status(401);

			if (isApiCall) {
				res.send(apiResultError('must be uploader'));
			} else {
				res.render('unauthorized', {
					redirectTarget: encodeURIComponent(req.originalUrl),
				});
			}
			return;
		}
		next();
	}

	return requireUploader;
};
