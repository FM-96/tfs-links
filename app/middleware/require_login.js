module.exports = function () {
	return requireLogin;
};

function requireLogin(req, res, next) {
	if (!req.auth) {
		res.render('login_required', {
			redirectTarget: encodeURIComponent(req.originalUrl),
		});
		return;
	}
	if (!req.auth.inGuild) {
		res.render('not_in_guild', {});
		return;
	}
	next();
}
