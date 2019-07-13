const mongoose = require('mongoose');

const schema = mongoose.Schema({
	userId: String,
	actionType: {
		type: String,
		required: true,
		enum: [
			'admin',
			'uploader',
			'user',
		],
	},
	action: {
		type: String,
		required: true,
		enum: [
			// admin actions
			'add_uploader',
			'delete_uploader',
			'export_links',
			'import_links',
			// uploader actions
			'add_link',
			'delete_link',
			// user actions
			'login',
			'logout',
			'visit_link',
		],
	},
	data: {},
	timestamp: {
		type: Date,
		default: Date.now,
	},
});

schema.virtual('dataStr')
	.get(function () {
		switch (this.action) {
			// admin actions
			case 'add_uploader':
				return this.data.uploaderId;
			case 'delete_uploader':
				return this.data.uploaderId;
			case 'export_links':
				return '';
			case 'import_links':
				return '';
			// uploader actions
			case 'add_link':
				return this.data.fullLink;
			case 'delete_link':
				return this.data.fullLink;
			// user actions
			case 'login':
				return '';
			case 'logout':
				return '';
			case 'visit_link':
				return this.data.fullLink;
			default:
				throw new Error(`Invalid action: ${this.action}`);
		}
	});

schema.set('toJSON', {virtuals: true});

module.exports = mongoose.model('ActionLogEntry', schema, 'actionlogentries');
