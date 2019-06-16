module.exports = {
	createUploader,
	deleteUploader,
	createLink,
	deleteLink,
};

const logger = require('winston').loggers.get('default');

const {apiResultError, apiResultOk} = require('../../utils/apiResults.js');

const Link = require('../../models/Link.js');
const Show = require('../../models/Show.js');
const Uploader = require('../../models/Uploader.js');
const Video = require('../../models/Video.js');

async function createUploader(req, res) {
	if (!req.body.userId) {
		res.status(400).send(apiResultError('malformed body'));
		return;
	}
	try {
		const existingUploader = await Uploader.findOne({userId: req.body.userId}).exec();
		if (existingUploader) {
			res.status(400).send(apiResultError('uploader already exists'));
			return;
		}
		const newUploader = new Uploader({
			userId: req.body.userId,
		});
		const saved = await newUploader.save();
		res.send(apiResultOk(saved));
	} catch (err) {
		logger.error('Error while creating uploader:');
		logger.error(err);
		res.status(500).send(apiResultError('database error'));
		return;
	}
}

async function deleteUploader(req, res) {
	const id = req.params.id;
	if (!id) {
		res.status(400).send(apiResultError('missing ID'));
		return;
	}
	try {
		const result = await Uploader.findOneAndDelete({userId: id}).exec();
		res.send(apiResultOk(result));
	} catch (err) {
		logger.error('Error while deleting uploader:');
		logger.error(err);
		res.status(500).send(apiResultError('database error'));
		return;
	}
}

async function createLink(req, res) {
	if (!req.body.show || !req.body.episodes || !req.body.url) {
		res.status(400).send(apiResultError('malformed body'));
		return;
	}
	try {
		let showCreated = false;
		let videoCreated = false;

		let show = await Show.findOne({name: req.body.show}).exec();
		if (!show) {
			const newShow = new Show({
				name: req.body.show,
				urlName: req.body.show.replace(/ /g, '_'), // TODO
			});
			show = await newShow.save();
			showCreated = true;
		}
		let video = await Video.findOne({show: show._id, episodes: req.body.episodes}).exec();
		if (!video) {
			const newVideo = new Video({
				show: show._id,
				episodes: req.body.episodes,
				urlEpisodes: req.body.episodes.replace(/ /g, '_'), // TODO
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
		}));
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
	} catch (err) {
		logger.error('Error while deleting link:');
		logger.error(err);
		res.status(500).send(apiResultError('database error'));
		return;
	}
}
