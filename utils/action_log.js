module.exports = {
	countPages,
	getAllEntries,
	getEntries,
	// admin actions
	addUploader,
	deleteUploader,
	exportLinks,
	importLinks,
	// uploader actions
	addLink,
	deleteLink,
	deleteShow,
	deleteVideo,
	// user actions
	login,
	logout,
	visitLink,
};

const ActionLogEntry = require('../models/ActionLogEntry.js');
const {ACTION_LOG_ITEMS_PER_PAGE} = require('../constants/pagination.js');

async function countPages() {
	const docCount = await ActionLogEntry.countDocuments().exec();
	return Math.ceil(docCount / ACTION_LOG_ITEMS_PER_PAGE);
}

async function getAllEntries() {
	return ActionLogEntry.find().sort({timestamp: -1}).exec();
}

async function getEntries(page) {
	return ActionLogEntry.find().sort({timestamp: -1}).skip((page - 1) * ACTION_LOG_ITEMS_PER_PAGE).limit(ACTION_LOG_ITEMS_PER_PAGE).exec();
}

// admin actions
async function addUploader(userId, data) {
	const entry = createActionLogEntry('add_uploader', userId, data);
	return entry.save();
}

async function deleteUploader(userId, data) {
	const entry = createActionLogEntry('delete_uploader', userId, data);
	return entry.save();
}

async function exportLinks(userId) {
	const entry = createActionLogEntry('export_links', userId, null);
	return entry.save();
}

async function importLinks(userId) {
	const entry = createActionLogEntry('import_links', userId, null);
	return entry.save();
}

// uploader actions
async function addLink(userId, data) {
	const entry = createActionLogEntry('add_link', userId, data);
	return entry.save();
}

async function deleteLink(userId, data) {
	const entry = createActionLogEntry('delete_link', userId, data);
	return entry.save();
}

async function deleteShow(userId, data) {
	const entry = createActionLogEntry('delete_show', userId, data);
	return entry.save();
}

async function deleteVideo(userId, data) {
	const entry = createActionLogEntry('delete_video', userId, data);
	return entry.save();
}

// user actions
async function login(userId) {
	const entry = createActionLogEntry('login', userId, null);
	return entry.save();
}

async function logout(userId) {
	const entry = createActionLogEntry('logout', userId, null);
	return entry.save();
}

async function visitLink(userId, data) {
	const entry = createActionLogEntry('visit_link', userId, data);
	return entry.save();
}

// internals
const types = {
	'add_uploader': 'admin',
	'delete_uploader': 'admin',
	'export_links': 'admin',
	'import_links': 'admin',
	'add_link': 'uploader',
	'delete_link': 'uploader',
	'delete_show': 'uploader',
	'delete_video': 'uploader',
	'login': 'user',
	'logout': 'user',
	'visit_link': 'user',
};

function createActionLogEntry(action, userId, data) {
	const newEntry = new ActionLogEntry({
		userId,
		actionType: types[action],
		action,
		data,
	});
	return newEntry;
}
