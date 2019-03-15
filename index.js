require('dotenv').config();

const cookieParser = require('cookie-parser');
const express = require('express');
const mongoose = require('mongoose');

const routes = require('./app/routes.js');

const app = express();
app.set('view engine', 'pug');
app.use(cookieParser());
app.use(routes);

mongoose.connect(process.env.MONGODB, {useNewUrlParser: true}).then(() => {
	app.listen(process.env.PORT, () => {
		console.log(`Listening on port ${process.env.PORT}`);
	});
}).catch(err => {
	console.error('Could not connect to database:');
	console.error(err);
	process.exit(1);
});
