module.exports = {
	actionLogPage,
	adminPage,
};

const logger = require('winston').loggers.get('default');

const actionLog = require('../../utils/action_log.js');
const version = require('../../utils/version.js');

const Uploader = require('../../models/Uploader.js');

async function actionLogPage(req, res) {
	const pugData = {
		auth: req.auth,
		version,
		entries: [],
	};
	try {
		const entries = await actionLog.getEntries();
		pugData.entries = entries;
		res.render('action_log', pugData);
	} catch (err) {
		logger.error('Error while handling admin page:');
		logger.error(err);
		res.status(500).render('error', pugData);
		return;
	}
}

async function adminPage(req, res) {
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
