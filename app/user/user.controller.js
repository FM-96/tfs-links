module.exports = {
	homePage,
	showPage,
	videoPage,
	linkPage,
};

const logger = require('winston').loggers.get('default');

const Link = require('../../models/Link.js');
const Show = require('../../models/Show.js');
const Video = require('../../models/Video.js');

async function homePage(req, res) {
	const pugData = {
		auth: req.auth,
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
		title: null,
		show: null,
		videos: null,
	};
	try {
		pugData.show = await Show.findOne({urlName: req.params.show}).exec();
		if (!pugData.show) {
			res.status(404).render('not_found', pugData);
			return;
		}
		pugData.videos = await Video.find({show: pugData.show._id}).exec();
		for (const video of pugData.videos) {
			video.links = await Link.find({video: video._id}).exec();
		}
		pugData.videos.sort((a, b) => {
			if (a.episodes.toLowerCase() < b.episodes.toLowerCase()) {
				return -1;
			}
			if (a.episodes.toLowerCase() > b.episodes.toLowerCase()) {
				return 1;
			}
			return 0;
		});

		pugData.title = pugData.show.name;

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
		title: null,
		show: null,
		video: null,
	};
	try {
		pugData.show = await Show.findOne({urlName: req.params.show}).exec();
		if (!pugData.show) {
			res.status(404).render('not_found', pugData);
			return;
		}
		pugData.video = await Video.findOne({show: pugData.show._id, urlEpisodes: req.params.episodes}).exec();
		if (!pugData.video) {
			res.status(404).render('not_found', pugData);
			return;
		}
		pugData.video.links = await Link.find({video: pugData.video._id}).exec();

		pugData.title = `${pugData.show.name} ${pugData.video.episodes}`;

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
	};
	try {
		const show = await Show.findOne({urlName: req.params.show}).exec();
		if (!show) {
			res.status(404).render('not_found', pugData);
			return;
		}
		const video = await Video.findOne({show: show._id, urlEpisodes: req.params.episodes}).exec();
		if (!video) {
			res.status(404).render('not_found', pugData);
			return;
		}
		const link = await Link.findOne({video: video._id, linkId: req.params.link}).exec();
		if (!link) {
			if (req.params.link > 0 && video.nextLinkId > req.params.link) {
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
