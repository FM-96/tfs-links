module.exports = {
	actionLogPage,
	adminPage,
};

const logger = require('winston').loggers.get('default');

const actionLog = require('../../../utils/action_log.js');
const version = require('../../../utils/version.js');

const Uploader = require('../../../models/Uploader.js');
const User = require('../../../models/User.js');

async function actionLogPage(req, res) {
	const pugData = {
		auth: req.auth,
		version,
		entries: [],
		users: {},
	};
	try {
		let entries;
		if (req.params.page === 'all') {
			entries = await actionLog.getAllEntries();
		} else {
			const activePage = Number(req.params.page);
			const pageCount = await actionLog.countPages();
			entries = await actionLog.getEntries(activePage);

			const displayPages = [];
			for (let i = Math.max(1, activePage - 2); i <= Math.min(pageCount, activePage + 2); ++i) {
				displayPages.push(i);
			}
			if (displayPages[0] !== 1) {
				displayPages.unshift(1);
			}
			if (displayPages[displayPages.length - 1] !== pageCount) {
				displayPages.push(pageCount);
			}

			const pagination = displayPages.map(e => ({
				text: e,
				active: e === activePage,
				url: `/actions/${e}`,
			})).reduce((acc, cur) => {
				if (acc[acc.length - 1] && acc[acc.length - 1].text !== '...' && acc[acc.length - 1].text !== cur.text - 1) {
					acc.push({text: '...'});
					acc.push(cur);
				} else {
					acc.push(cur);
				}
				return acc;
			}, []);

			pugData.pagination = pagination;
		}
		pugData.entries = entries;
		const usersArr = await User.find({userId: {$in: entries.map(e => e.userId)}}).exec();
		usersArr.forEach(e => {
			pugData.users[e.userId] = e;
		});
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
