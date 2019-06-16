const mongoose = require('mongoose');

const schema = mongoose.Schema({
	userId: String,
});

module.exports = mongoose.model('Uploader', schema, 'uploaders');
