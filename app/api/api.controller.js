module.exports = {
	createUploader,
	deleteUploader,
	createLink,
	deleteLink,
	listShows,
	listVideos,
	exportLinks,
	importLinks,
};

const logger = require('winston').loggers.get('default');

const actionLog = require('../../utils/action_log.js');
const {apiResultError, apiResultOk} = require('../../utils/api_results.js');

const Link = require('../../models/Link.js');
const Show = require('../../models/Show.js');
const Uploader = require('../../models/Uploader.js');
const User = require('../../models/User.js');
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
		const uploaderUser = await User.findOne({userId: req.body.userId}).exec();
		const newUploader = new Uploader({
			userId: req.body.userId,
			info: uploaderUser ? uploaderUser.info : {},
		});
		const saved = await newUploader.save();
		res.send(apiResultOk(saved));
		await actionLog.addUploader(req.auth.userId, {uploaderId: req.body.userId});
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
		await actionLog.deleteUploader(req.auth.userId, {uploaderId: id});
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

async function listShows(req, res) {
	try {
		const shows = await Show.find().exec();
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
		const videos = await Video.find({show: show._id}).exec();
		res.send(videos);
	} catch (err) {
		logger.error(`Error while listing videos for "${req.params.show}":`);
		logger.error(err);
		res.status(500).send(apiResultError('database error'));
		return;
	}
}

async function exportLinks(req, res) {
	try {
		const exportedData = {
			format: 1,
			shows: [],
		};
		const shows = await Show.find({}).exec();
		for (const show of shows) {
			const showData = {
				name: show.name,
				videos: [],
			};
			const videos = await Video.find({show: show._id}).exec();
			for (const video of videos) {
				const videoData = {
					episodes: video.episodes,
					nextLinkId: video.nextLinkId,
					links: [],
				};
				const links = await Link.find({video: video._id}).exec();
				for (const link of links) {
					const linkData = {
						linkId: link.linkId,
						url: link.url,
						uploaderId: link.uploaderId,
					};
					videoData.links.push(linkData);
				}
				showData.videos.push(videoData);
			}
			exportedData.shows.push(showData);
		}
		res
			.set('Content-Disposition', `attachment; filename="tfs-links-${(new Date()).toISOString().replace(/-|:|\.\d+/g, '')}.json"`)
			.send(JSON.stringify(exportedData, null, '\t') + '\n');
		await actionLog.exportLinks(req.auth.userId);
	} catch (err) {
		logger.error(`Error while exporting data:`);
		logger.error(err);
		res.status(500).send(apiResultError('database error'));
		return;
	}
}

async function importLinks(req, res) {
	try {
		logger.debug('clearing existing data');
		await Promise.all([Show.deleteMany({}), Video.deleteMany({}), Link.deleteMany({})]);
		for (const showData of req.body.shows) {
			logger.debug(`importing show "${showData.name}"`);
			let show = new Show({
				name: showData.name,
				urlName: urlTransform(showData.name),
			});
			show = await show.save();
			for (const videoData of showData.videos) {
				logger.debug(`importing video "${videoData.episodes}"`);
				let video = new Video({
					show: show._id,
					episodes: videoData.episodes,
					urlEpisodes: urlTransform(videoData.episodes),
					nextLinkId: videoData.nextLinkId,
				});
				video = await video.save();
				for (const linkData of videoData.links) {
					logger.debug(`importing link ${linkData.linkId}`);
					let link = new Link({
						video: video._id,
						linkId: linkData.linkId,
						url: linkData.url,
						uploaderId: linkData.uploaderId,
					});
					link = await link.save();
				}
			}
		}
		res.send(apiResultOk('success'));
		await actionLog.importLinks(req.auth.userId);
	} catch (err) {
		logger.error(`Error while importing data:`);
		logger.error(err);
		res.status(500).send(apiResultError('database error'));
		return;
	}
}

function urlTransform(value) {
	return value.replace(/ /g, '_').replace(/'/g, '');
}
