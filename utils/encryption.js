const Cryptr = require('cryptr');
const cryptr = new Cryptr(process.env.ENCRYPTION_SECRET);

module.exports = {
	decrypt: cryptr.decrypt,
	encrypt: cryptr.encrypt,
};
