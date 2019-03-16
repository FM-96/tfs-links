module.exports = {
	auth,
	login,
	logout,
};

const got = require('got');
const jwt = require('../../utils/jwt_promisified.js');

const crypto = require('crypto');
const util = require('util');

const User = require('../../models/User.js');

const {
	API_BASE,
	JWT_ALGORITHM,
	JWT_COOKIE_EXPIRATION,
	JWT_EXPIRATION,
	OAUTH2_STATE_EXPIRY,
	REQUIRED_SCOPES,
} = require('../../constants/login.js');

const randomBytes = util.promisify(crypto.randomBytes);

const IS_PRODUCTION = process.env.NODE_ENV === 'production';

const {CLIENT_ID, CLIENT_SECRET, REDIRECT_URL} = process.env;

const states = new Map();

async function auth(req, res) {
	try {
		const {code, state} = req.query;
		if (!code || !state || !states.has(state) || states.get(state).expires < Date.now()) {
			throw new Error('Invalid authorization attempt');
		}

		const redirectTarget = states.get(state).redirectTarget;
		states.delete(state);

		const postBody = {
			client_id: CLIENT_ID,
			client_secret: CLIENT_SECRET,
			grant_type: 'authorization_code',
			code: code,
			redirect_uri: REDIRECT_URL,
			scope: REQUIRED_SCOPES.join(' '),
		};

		const response = await got.post('/oauth2/token', {
			baseUrl: API_BASE,
			body: postBody,
			form: true,
			json: true,
		});

		if (!REQUIRED_SCOPES.every(e => response.body.scope.includes(e))) {
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

		// save credentials to database
		let dbEntry = await User.findOne({userId}).exec();
		if (!dbEntry) {
			dbEntry = new User({
				userId,
				jwtSecret: (await randomBytes(20)).toString('base64'),
				oauth2: {},
			});
		}
		dbEntry.oauth2.accessToken = accessToken;
		dbEntry.oauth2.refreshToken = refreshToken;
		dbEntry.oauth2.scopes = response.body.scope;
		dbEntry.oauth2.tokenExpiry = tokenExpiry;
		await dbEntry.save();

		// create JWT
		const token = await jwt.sign({
			userId,
			scopes: response.body.scope,
			guildsChecked: 0,
		}, dbEntry.jwtSecret, {
			algorithm: JWT_ALGORITHM,
			expiresIn: JWT_EXPIRATION,
		});

		res.cookie('jwt', token, {
			httpOnly: true,
			maxAge: JWT_COOKIE_EXPIRATION,
			sameSite: 'lax',
			secure: IS_PRODUCTION,
		});

		res.redirect(redirectTarget);
	} catch (err) {
		res.status(500).render('login_error');
	}
}

async function login(req, res) {
	try {
		let redirectTarget = '/';
		// ensure the redirect cannot lead to a different site
		if (typeof req.query.target === 'string' && /^\/[^/]/.test(req.query.target)) {
			redirectTarget = req.query.target;
		}

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
			redirectTarget,
			expires: Date.now() + OAUTH2_STATE_EXPIRY,
		});

		const authLink = `${API_BASE}/oauth2/authorize?response_type=code&client_id=${CLIENT_ID}&scope=${REQUIRED_SCOPES.join('%20')}&state=${state}&redirect_uri=${encodeURIComponent(REDIRECT_URL)}`;

		res.redirect(authLink);
	} catch (err) {
		res.status(500).render('login_error');
	}
}

function logout(req, res) {
	res.clearCookie('jwt', {
		httpOnly: true,
		sameSite: 'lax',
		secure: IS_PRODUCTION,
	});
	res.redirect('/');
}

// periodically clean up expired states
setInterval(function () {
	for (const [key, value] of states.entries()) {
		if (value.expires < Date.now()) {
			states.delete(key);
		}
	}
}, 3600000);
