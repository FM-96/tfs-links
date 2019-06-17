module.exports = {
	handle,
};

const logger = require('winston').loggers.get('default');

const version = require('../../utils/version.js');

const Uploader = require('../../models/Uploader.js');

async function handle(req, res) {
	const pugData = {
		auth: req.auth,
		version,
		uploaders: [],
	};
	try {
		const uploaders = await Uploader.find().exec();
		pugData.uploaders = uploaders;
		res.render('admin', pugData);
	} catch (err) {
		logger.error('Error while handling admin page:');
		logger.error(err);
		res.status(500).render('error', pugData);
		return;
	}
}
