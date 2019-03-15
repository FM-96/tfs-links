const jwt = require('jsonwebtoken');

const util = require('util');

module.exports = {
	decode: jwt.decode, // function is not asynchronous
	sign: util.promisify(jwt.sign),
	verify: util.promisify(jwt.verify),
};
