const mongoose = require('mongoose');

const schema = mongoose.Schema({
	name: String,
	urlName: String,
});

module.exports = mongoose.model('Show', schema, 'shows');
