const mongoose = require('mongoose');

const {decrypt, encrypt} = require('../utils/encryption.js');

const schema = mongoose.Schema({
	userId: String,
	jwtSecret: String,
	oauth2: {
		accessToken: String,
		refreshToken: String,
		scopes: [String],
		tokenExpiry: Date,
	},
	info: {
		avatarEnc: String,
		usernameEnc: String,
		discriminatorEnc: String,
	},
});

schema.virtual('info.avatar')
	.get(function () {
		return this.info.avatarEnc && decrypt(this.info.avatarEnc);
	})
	.set(function (val) {
		this.info.avatarEnc = val && encrypt(val);
	});
schema.virtual('info.username')
	.get(function () {
		return this.info.usernameEnc && decrypt(this.info.usernameEnc);
	})
	.set(function (val) {
		this.info.usernameEnc = val && encrypt(val);
	});
schema.virtual('info.discriminator')
	.get(function () {
		return this.info.discriminatorEnc && decrypt(this.info.discriminatorEnc);
	})
	.set(function (val) {
		this.info.discriminatorEnc = val && encrypt(val);
	});

schema.virtual('info.tag')
	.get(function () {
		if (this.info.usernameEnc && this.info.discriminatorEnc) {
			return decrypt(this.info.usernameEnc) + '#' + decrypt(this.info.discriminatorEnc);
		}
		return undefined;
	});

schema.set('toJSON', {virtuals: true});

module.exports = mongoose.model('User', schema, 'users');
