module.exports = {
	getEntries,
	// admin actions
	addUploader,
	deleteUploader,
	exportLinks,
	importLinks,
	// uploader actions
	addLink,
	deleteLink,
	// user actions
	login,
	logout,
	visitLink,
};

const ActionLogEntry = require('../models/ActionLogEntry.js');

async function getEntries() {
	return ActionLogEntry.find().sort({timestamp: -1}).exec();
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
