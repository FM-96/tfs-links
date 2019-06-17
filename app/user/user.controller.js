module.exports = {
	homePage,
	showPage,
	videoPage,
	linkPage,
};

const logger = require('winston').loggers.get('default');

const version = require('../../utils/version.js');

const Link = require('../../models/Link.js');
const Show = require('../../models/Show.js');
const User = require('../../models/User.js');
const Video = require('../../models/Video.js');

async function homePage(req, res) {
	const pugData = {
		auth: req.auth,
		version,
		shows: null,
	};
	try {
		pugData.shows = await Show.find().exec();
		pugData.shows.sort((a, b) => {
			if (a.name.toLowerCase() < b.name.toLowerCase()) {
				return -1;
			}
			if (a.name.toLowerCase() > b.name.toLowerCase()) {
				return 1;
			}
			return 0;
		});

		res.render('home', pugData);
	} catch (err) {
		logger.error('Error while handling home page:');
		logger.error(err);
		res.status(500).render('error', pugData);
		return;
	}
}

async function showPage(req, res) {
	const pugData = {
		auth: req.auth,
		version,
		title: null,
		breadcrumbs: [],
		show: null,
		videos: null,
	};
	try {
		const show = await Show.findOne({urlName: req.params.show}).exec();
		if (!show) {
			res.status(404).render('not_found', pugData);
			return;
		}
		pugData.breadcrumbs.push({text: show.name, url: `/${show.urlName}`});

		const videos = await Video.find({show: show._id}).exec();
		for (const video of videos) {
			video.links = await Link.find({video: video._id}).exec();
			for (const link of video.links) {
				link.uploader = await User.findOne({userId: link.uploaderId}).select({userId: 1, info: 1}).exec();
			}
		}
		videos.sort((a, b) => {
			if (a.episodes.toLowerCase() < b.episodes.toLowerCase()) {
				return -1;
			}
			if (a.episodes.toLowerCase() > b.episodes.toLowerCase()) {
				return 1;
			}
			return 0;
		});

		pugData.title = show.name;
		pugData.show = show;
		pugData.videos = videos;

		res.render('show', pugData);
	} catch (err) {
		logger.error(`Error while handling show page "${req.params.show}":`);
		logger.error(err);
		res.status(500).render('error', pugData);
		return;
	}
}

async function videoPage(req, res) {
	const pugData = {
		auth: req.auth,
		version,
		title: null,
		breadcrumbs: [],
		show: null,
		video: null,
	};
	try {
		const show = await Show.findOne({urlName: req.params.show}).exec();
		if (!show) {
			res.status(404).render('not_found', pugData);
			return;
		}
		pugData.breadcrumbs.push({text: show.name, url: `/${show.urlName}`});

		const video = await Video.findOne({show: show._id, urlEpisodes: req.params.episodes}).exec();
		if (!video) {
			res.status(404).render('not_found', pugData);
			return;
		}
		pugData.breadcrumbs.push({text: video.episodes, url: `/${show.urlName}/${video.urlEpisodes}`});

		video.links = await Link.find({video: video._id}).exec();
		for (const link of video.links) {
			link.uploader = await User.findOne({userId: link.uploaderId}).select({userId: 1, info: 1}).exec();
		}

		pugData.title = `${show.name} ${video.episodes}`;
		pugData.show = show;
		pugData.video = video;

		res.render('video', pugData);
	} catch (err) {
		logger.error(`Error while handling video page "${req.params.show}/${req.params.episodes}":`);
		logger.error(err);
		res.status(500).render('error', pugData);
		return;
	}
}

async function linkPage(req, res) {
	const pugData = {
		auth: req.auth,
		version,
		breadcrumbs: [],
	};
	try {
		const show = await Show.findOne({urlName: req.params.show}).exec();
		if (!show) {
			res.status(404).render('not_found', pugData);
			return;
		}
		pugData.breadcrumbs.push({text: show.name, url: `/${show.urlName}`});

		const video = await Video.findOne({show: show._id, urlEpisodes: req.params.episodes}).exec();
		if (!video) {
			res.status(404).render('not_found', pugData);
			return;
		}
		pugData.breadcrumbs.push({text: video.episodes, url: `/${show.urlName}/${video.urlEpisodes}`});

		const link = await Link.findOne({video: video._id, linkId: req.params.link}).exec();
		if (!link) {
			if (req.params.link > 0 && video.nextLinkId > req.params.link) {
				pugData.breadcrumbs.push({text: req.params.link, url: `/${show.urlName}/${video.urlEpisodes}/${req.params.link}`});
				res.status(410).render('gone', pugData);
			} else {
				res.status(404).render('not_found', pugData);
			}
			return;
		}

		res.redirect(link.url);
	} catch (err) {
		logger.error(`Error while handling link page "${req.params.show}/${req.params.episodes}/${req.params.link}":`);
		logger.error(err);
		res.status(500).render('error', pugData);
		return;
	}
}
