const mongoose = require('mongoose');

const schema = mongoose.Schema({
	userId: String,
	jwtSecret: String,
	oauth2: {
		accessToken: String,
		refreshToken: String,
		scopes: [String],
		tokenExpiry: Date,
	},
});

module.exports = mongoose.model('User', schema, 'users');
