const mongoose = require('mongoose');

const schema = mongoose.Schema({
	show: mongoose.Schema.Types.ObjectId,
	date: String,
	episodes: String,
	urlEpisodes: String,
	nextLinkId: {
		type: Number,
		default: 1,
	},
});

module.exports = mongoose.model('Video', schema, 'videos');
