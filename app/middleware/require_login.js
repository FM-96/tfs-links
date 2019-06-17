module.exports = function () {
	return requireLogin;
};

const version = require('../../utils/version.js');

function requireLogin(req, res, next) {
	const pugData = {
		auth: req.auth,
		version,
	};
	// TODO differentiate for API calls
	if (!req.auth) {
		pugData.redirectTarget = encodeURIComponent(req.originalUrl);
		res.render('login_required', pugData);
		return;
	}
	if (!req.auth.inGuild) {
		res.render('not_in_guild', pugData);
		return;
	}
	next();
}
