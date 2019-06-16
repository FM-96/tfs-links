const mongoose = require('mongoose');

const schema = mongoose.Schema({
	video: mongoose.Schema.Types.ObjectId,
	linkId: Number,
	url: String,
	uploaderId: String,
});

module.exports = mongoose.model('Link', schema, 'links');
