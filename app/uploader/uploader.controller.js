module.exports = {
	handle,
};

const logger = require('winston').loggers.get('default');

async function handle(req, res) {
	const pugData = {
		auth: req.auth,
	};
	try {
		res.render('uploader', pugData);
	} catch (err) {
		logger.error('Error while handling uploader page:');
		logger.error(err);
		res.status(500).render('error', pugData);
		return;
	}
}
