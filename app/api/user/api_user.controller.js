module.exports = {
	listShows,
	listVideos,
};

const logger = require('winston').loggers.get('default');

const {apiResultError} = require('../../../utils/api_results.js');

const Show = require('../../../models/Show.js');
const Video = require('../../../models/Video.js');

async function listShows(req, res) {
	try {
		const shows = await Show.find().sort({name: 1}).exec();
		res.send(shows);
	} catch (err) {
		logger.error('Error while listing shows:');
		logger.error(err);
		res.status(500).send(apiResultError('database error'));
		return;
	}
}

async function listVideos(req, res) {
	try {
		const show = await Show.findOne({urlName: req.params.show}).exec();
		if (!show) {
			res.status(404).send(apiResultError('show not found'));
			return;
		}
		const videos = await Video.find({show: show._id}).sort({episodes: 1}).exec();
		res.send(videos);
	} catch (err) {
		logger.error(`Error while listing videos for "${req.params.show}":`);
		logger.error(err);
		res.status(500).send(apiResultError('database error'));
		return;
	}
}
