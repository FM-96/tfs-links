const packageVersion = require('../package.json').version;

module.exports = 'v' + packageVersion + (process.env.NODE_ENV === 'production' ? '' : '-dev');
