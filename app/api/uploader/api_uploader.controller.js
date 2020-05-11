module.exports = {
	createLink,
	deleteLink,
	deleteShow,
	deleteVideo,
};

const logger = require('winston').loggers.get('default');

const actionLog = require('../../../utils/action_log.js');
const {apiResultError, apiResultOk} = require('../../../utils/api_results.js');

const Link = require('../../../models/Link.js');
const Show = require('../../../models/Show.js');
const Video = require('../../../models/Video.js');

async function createLink(req, res) {
	if ([req.body.show, req.body.episodes, req.body.url].some(e => !e || typeof e !== 'string')) {
		res.status(400).send(apiResultError('malformed body'));
		return;
	}
	req.body.show = req.body.show.trim();
	req.body.episodes = req.body.episodes.trim();
	req.body.url = req.body.url.trim();
	try {
		new URL(req.body.url); // eslint-disable-line no-new
	} catch (err) {
		res.status(400).send(apiResultError('invalid URL'));
		return;
	}
	try {
		let showCreated = false;
		let videoCreated = false;

		let show = await Show.findOne({name: req.body.show}).exec();
		if (!show) {
			const newShow = new Show({
				name: req.body.show,
				urlName: urlTransform(req.body.show),
			});
			show = await newShow.save();
			showCreated = true;
		}
		let video = await Video.findOne({show: show._id, episodes: req.body.episodes}).exec();
		if (!video) {
			const newVideo = new Video({
				show: show._id,
				episodes: req.body.episodes,
				urlEpisodes: urlTransform(req.body.episodes),
			});
			video = await newVideo.save();
			videoCreated = true;
		}
		const existingLink = await Link.findOne({video: video._id, url: req.body.url}).exec();
		if (existingLink) {
			res.status(400).send(apiResultError('link already exists'));
			return;
		}

		const updatedVideo = await Video.findByIdAndUpdate(video._id, {$inc: {nextLinkId: 1}}).exec();
		const newLink = new Link({
			video: video._id,
			linkId: updatedVideo.nextLinkId,
			url: req.body.url,
			uploaderId: req.auth.userId,
		});
		const saved = await newLink.save();
		res.send(apiResultOk({
			showCreated,
			videoCreated,
			link: saved,
			videoLink: `/${show.urlName}/${video.urlEpisodes}`,
		}));
		await actionLog.addLink(req.auth.userId, {
			show: show.name,
			video: video.episodes,
			link: newLink.linkId,
			linkUrl: newLink.url,
			fullLink: `/${show.urlName}/${video.urlEpisodes}/${newLink.linkId}`,
			showCreated,
			videoCreated,
		});
	} catch (err) {
		logger.error('Error while creating link:');
		logger.error(err);
		res.status(500).send(apiResultError('database error'));
		return;
	}
}

async function deleteLink(req, res) {
	try {
		const show = await Show.findOne({urlName: req.params.show}).exec();
		if (!show) {
			res.status(404).send(apiResultError('show not found'));
			return;
		}
		const video = await Video.findOne({show: show._id, urlEpisodes: req.params.episodes}).exec();
		if (!video) {
			res.status(404).send(apiResultError('video not found'));
			return;
		}
		const link = await Link.findOneAndDelete({video: video._id, linkId: req.params.id}).exec();
		res.send(apiResultOk(link));
		await actionLog.deleteLink(req.auth.userId, {
			show: show.name,
			video: video.episodes,
			link: link.linkId,
			linkUrl: link.url,
			fullLink: `/${show.urlName}/${video.urlEpisodes}/${link.linkId}`,
		});
	} catch (err) {
		logger.error('Error while deleting link:');
		logger.error(err);
		res.status(500).send(apiResultError('database error'));
		return;
	}
}

async function deleteShow(req, res) {
	if ([req.params.show].some(e => typeof e !== 'string' || !e.trim())) {
		res.status(400).send(apiResultError('malformed body'));
		return;
	}
	req.params.show = req.params.show.trim();
	try {
		const show = await Show.findOne({urlName: req.params.show}).exec();
		if (!show) {
			res.status(404).send(apiResultError('show not found'));
			return;
		}
		const video = await Video.findOne({show: show._id}).exec();
		if (video) {
			res.status(400).send(apiResultError('show not empty'));
			return;
		}

		await show.remove();
		res.send(apiResultOk());

		await actionLog.deleteShow(req.auth.userId, {
			show: show.name,
			fullLink: `/${show.urlName}`,
		});
	} catch (err) {
		logger.error('Error while deleting show:');
		logger.error(err);
		res.status(500).send(apiResultError('database error'));
		return;
	}
}

async function deleteVideo(req, res) {
	if ([req.params.show, req.params.episodes].some(e => typeof e !== 'string' || !e.trim())) {
		res.status(400).send(apiResultError('malformed body'));
		return;
	}
	req.params.show = req.params.show.trim();
	req.params.episodes = req.params.episodes.trim();
	try {
		const show = await Show.findOne({urlName: req.params.show}).exec();
		if (!show) {
			res.status(404).send(apiResultError('show not found'));
			return;
		}
		const video = await Video.findOne({show: show._id, urlEpisodes: req.params.episodes}).exec();
		if (!video) {
			res.status(404).send(apiResultError('video not found'));
			return;
		}
		const link = await Link.findOne({video: video._id}).exec();
		if (link) {
			res.status(400).send(apiResultError('video not empty'));
			return;
		}

		await video.remove();
		res.send(apiResultOk());

		await actionLog.deleteVideo(req.auth.userId, {
			show: show.name,
			video: video.episodes,
			fullLink: `/${show.urlName}/${video.urlEpisodes}`,
		});
	} catch (err) {
		logger.error('Error while deleting video:');
		logger.error(err);
		res.status(500).send(apiResultError('database error'));
		return;
	}
}

function urlTransform(value) {
	return value.replace(/ /g, '_').replace(/'/g, '');
}
