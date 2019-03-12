require('dotenv').config();

const express = require('express');

const routes = require('./app/routes.js');

const app = express();
app.set('view engine', 'pug');
app.use(routes);

app.listen(process.env.PORT, () => {
	console.log(`Listening on port ${process.env.PORT}`);
});
