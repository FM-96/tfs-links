module.exports = {
	apiResultError,
	apiResultOk,
};

function apiResultError(error) {
	return {
		status: 'error',
		error,
	};
}

function apiResultOk(data) {
	return {
		status: 'ok',
		data,
	};
}
