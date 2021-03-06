module.exports = function () {
	return processJwt;
};

const got = require('got');
const jwt = require('../../utils/jwt_promisified.js');
const logger = require('winston').loggers.get('default');

const Uploader = require('../../models/Uploader.js');
const User = require('../../models/User.js');

const {
	API_BASE,
	GUILDS_CHECK_INTERVAL,
	JWT_ALGORITHM,
	JWT_COOKIE_EXPIRATION,
	JWT_EXPIRATION,
	JWT_RENEW_INTERVAL,
	OAUTH2_TOKEN_REFRESH,
	REQUIRED_SCOPES,
	USER_INFO_CHECK_INTERVAL,
} = require('../../constants/login.js');

const IS_PRODUCTION = process.env.NODE_ENV === 'production';

const {CLIENT_ID, CLIENT_SECRET, REDIRECT_URL} = process.env;
const REQUIRED_GUILD_IDS = process.env.REQUIRED_GUILD_IDS.split(',');
const ADMIN_IDS = process.env.ADMIN_IDS.split(',');

async function processJwt(req, res, next) {
	const token = req.cookies.jwt;
	if (token) {
		let authFail = false;
		let authReissue = false;

		let payload, secret;
		let inGuild = false;
		try {
			payload = jwt.decode(token);

			if (!REQUIRED_SCOPES.every(e => payload.scopes.includes(e))) {
				throw new Error('Token is not for all required scopes');
			}

			const dbEntry = await User.findOne({userId: payload.userId}).exec();
			if (!dbEntry) {
				throw new Error('User not in database');
			}

			secret = dbEntry.jwtSecret;
			await jwt.verify(token, secret, {
				algorithm: JWT_ALGORITHM,
			});

			if (Date.now() - payload.userInfoChecked > USER_INFO_CHECK_INTERVAL) {
				logger.debug('Updating user information');
				// refresh OAuth2 access token if needed
				if (dbEntry.oauth2.tokenExpiry - Date.now() < OAUTH2_TOKEN_REFRESH) {
					await refreshAccessToken(dbEntry);
				}

				// get user information
				const identifyResponse = await got('users/@me', {
					prefixUrl: API_BASE,
					headers: {
						Authorization: `Bearer ${dbEntry.oauth2.accessToken}`,
					},
					responseType: 'json',
				});

				await updateUserInfo(identifyResponse.body, dbEntry);
				logger.debug('JWT will be reissued (reason: user info update)');
				payload.userInfoChecked = Date.now();
				authReissue = true;
			}

			if (Date.now() - payload.guildsChecked > GUILDS_CHECK_INTERVAL) {
				logger.debug('Checking for guild membership');
				// refresh OAuth2 access token if needed
				if (dbEntry.oauth2.tokenExpiry - Date.now() < OAUTH2_TOKEN_REFRESH) {
					await refreshAccessToken(dbEntry);
				}

				// check if the user is in at least one of the required guilds
				const guildsResponse = await got('users/@me/guilds', {
					prefixUrl: API_BASE,
					headers: {
						Authorization: `Bearer ${dbEntry.oauth2.accessToken}`,
					},
					responseType: 'json',
				});

				if (REQUIRED_GUILD_IDS.some(e => guildsResponse.body.find(f => f.id === e))) {
					logger.debug('JWT will be reissued (reason: guilds check)');
					payload.guildsChecked = Date.now();
					authReissue = true;
					inGuild = true;
				}
			} else {
				inGuild = true;
			}

			if (Date.now() - (payload.iat * 1000) > JWT_RENEW_INTERVAL) {
				logger.debug('JWT will be reissued (reason: age)');
				authReissue = true;
			}

			const uploader = await Uploader.findOne({userId: payload.userId}).exec();

			req.auth = {
				userId: payload.userId,
				inGuild,
				isAdmin: ADMIN_IDS.includes(payload.userId),
				isUploader: Boolean(uploader),
				info: {
					avatar: dbEntry.info.avatar,
					username: dbEntry.info.username,
					discriminator: dbEntry.info.discriminator,
					tag: dbEntry.info.tag,
				},
			};
		} catch (err) {
			logger.debug('Exception while processing JWT:');
			logger.debug(err);
			authFail = true;
		}

		if (authFail) {
			logger.debug('Authentication failed, clearing cookie');
			res.clearCookie('jwt', {
				httpOnly: true,
				sameSite: 'lax',
				secure: IS_PRODUCTION,
			});
		} else if (authReissue) {
			logger.debug('Reissuing JWT');
			const newToken = await jwt.sign({
				userId: payload.userId,
				scopes: payload.scopes,
				guildsChecked: payload.guildsChecked,
				userInfoChecked: payload.userInfoChecked,
			}, secret, {
				algorithm: JWT_ALGORITHM,
				expiresIn: JWT_EXPIRATION,
			});
			res.cookie('jwt', newToken, {
				httpOnly: true,
				maxAge: JWT_COOKIE_EXPIRATION,
				sameSite: 'lax',
				secure: IS_PRODUCTION,
			});
		}
	}
	next();
}

async function refreshAccessToken(dbEntry) {
	logger.debug('Refreshing OAuth2 access token');
	const postBody = {
		client_id: CLIENT_ID,
		client_secret: CLIENT_SECRET,
		grant_type: 'refresh_token',
		refresh_token: dbEntry.oauth2.refreshToken,
		redirect_uri: REDIRECT_URL,
		scope: REQUIRED_SCOPES.join(' '),
	};
	const response = await got.post('oauth2/token', {
		prefixUrl: API_BASE,
		form: postBody,
		responseType: 'json',
	});

	dbEntry.oauth2.accessToken = response.body.access_token;
	dbEntry.oauth2.refreshToken = response.body.refresh_token;
	dbEntry.oauth2.tokenExpiry = Date.now() + (response.body.expires_in * 1000);
	return dbEntry.save();
}

async function updateUserInfo(apiUser, dbUser) {
	dbUser.info.avatar = getUserAvatarUrl(apiUser);
	dbUser.info.username = apiUser.username;
	dbUser.info.discriminator = apiUser.discriminator;
	await dbUser.save();
	const dbUploader = await Uploader.findOne({userId: apiUser.id}).exec();
	if (dbUploader) {
		dbUploader.info.avatar = getUserAvatarUrl(apiUser);
		dbUploader.info.username = apiUser.username;
		dbUploader.info.discriminator = apiUser.discriminator;
		await dbUploader.save();
	}
}

function getUserAvatarUrl(apiUser) {
	if (apiUser.avatar) {
		if (apiUser.avatar.startsWith('a_')) {
			return `https://cdn.discordapp.com/avatars/${apiUser.id}/${apiUser.avatar}.gif`;
		} else {
			return `https://cdn.discordapp.com/avatars/${apiUser.id}/${apiUser.avatar}.png`;
		}
	} else {
		return `https://cdn.discordapp.com/embed/avatars/${apiUser.discriminator % 5}.png`;
	}
}
