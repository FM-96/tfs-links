require('dotenv').config();
require('./utils/configure_logger.js');

const cookieParser = require('cookie-parser');
const express = require('express');
const mongoose = require('mongoose');
const logger = require('winston').loggers.get('default');

const routes = require('./app/routes.js');

const app = express();
app.set('view engine', 'pug');
app.use(cookieParser());
app.use(express.json());
app.use(routes);

mongoose.connect(process.env.MONGODB, {
	useFindAndModify: false,
	useNewUrlParser: true,
}).then(() => {
	app.listen(process.env.PORT, () => {
		logger.info(`Listening on port ${process.env.PORT}`);
	});
}).catch(err => {
	logger.fatal('Could not connect to database:');
	logger.fatal(err);
	process.exit(1);
});
