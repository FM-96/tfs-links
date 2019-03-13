module.exports = {
	auth,
	login,
};

const got = require('got');

const crypto = require('crypto');
const util = require('util');

const randomBytes = util.promisify(crypto.randomBytes);

const API_BASE = 'https://discordapp.com/api/v6';

const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REDIRECT_URL = process.env.REDIRECT_URL;

const scopes = ['identify', 'guilds'];

const states = new Map();

async function auth(req, res) {
	try {
		const {code, state} = req.query;
		if (!code || !state || !states.has(state) || states.get(state).expires < Date.now()) {
			throw new Error('Invalid authorization attempt');
		}

		const redirectTarget = states.get(state).target;
		states.delete(state);

		const postBody = {
			client_id: CLIENT_ID,
			client_secret: CLIENT_SECRET,
			grant_type: 'authorization_code',
			code: code,
			redirect_uri: REDIRECT_URL,
			scope: scopes.join(' '),
		};

		const response = await got.post('/oauth2/token', {
			baseUrl: API_BASE,
			body: postBody,
			form: true,
			json: true,
		});

		if (!scopes.every(e => response.body.scope.includes(e))) {
			throw new Error('Not all required scopes were granted');
		}

		const accessToken = response.body.access_token;
		const refreshToken = response.body.refresh_token;
		const tokenExpiry = Date.now() + (response.body.expires_in * 1000);

		const identifyResponse = await got('/users/@me', {
			baseUrl: API_BASE,
			headers: {
				Authorization: `Bearer ${accessToken}`,
			},
			json: true,
		});

		const userId = identifyResponse.body.id;

		// TODO save in database
		// TODO create JWT

		res.send(`Welcome, ${identifyResponse.body.username}#${identifyResponse.body.discriminator}`);
	} catch (err) {
		res.sendStatus(500);
	}
}

async function login(req, res) {
	try {
		let state;
		let uniqueState = false;
		do {
			const buf = await randomBytes(20);
			state = buf.toString('base64').replace(/=/g, '');
			if (!states.has(state)) {
				uniqueState = true;
			}
		} while (!uniqueState);

		states.set(state, {
			target: req.query.target || '/',
			expires: Date.now() + 300000, // expires in 5 minutes
		});

		const authLink = `${API_BASE}/oauth2/authorize?response_type=code&client_id=${CLIENT_ID}&scope=${scopes.join('%20')}&state=${state}&redirect_uri=${encodeURIComponent(REDIRECT_URL)}`;

		res.redirect(authLink);
	} catch (err) {
		res.sendStatus(500);
	}
}

// periodically clean up expired states
setInterval(function () {
	for (const [key, value] of states.entries()) {
		if (value.expires < Date.now()) {
			states.delete(key);
		}
	}
}, 3600000);
