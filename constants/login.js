module.exports = {
	API_BASE: 'https://discordapp.com/api/v6',
	GUILDS_CHECK_INTERVAL: 60 * 60 * 1000, // 1 hour
	JWT_ALGORITHM: 'HS256',
	JWT_COOKIE_EXPIRATION: 7 * 24 * 60 * 60 * 1000, // 7 days
	JWT_EXPIRATION: '7 days',
	JWT_RENEW_INTERVAL: 60 * 60 * 1000, // 1 hour
	OAUTH2_STATE_EXPIRY: 5 * 60 * 1000, // 5 minutes
	OAUTH2_TOKEN_REFRESH: 24 * 60 * 60 * 1000, // 1 day
	REQUIRED_SCOPES: ['identify', 'guilds'],
};
