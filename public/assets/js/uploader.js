(function () {
	// add link
	document.getElementById('add-link').addEventListener('click', function (evt) {
		const show = document.getElementById('add-show').value;
		const episodes = document.getElementById('add-episodes').value;
		const url = document.getElementById('add-url').value;
		fetch(`/api/links`, {
			method: 'POST',
			credentials: 'same-origin',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({show, episodes, url}),
		}).then(async res => {
			// TODO better error check
			if (res.status !== 200) {
				$('body').toast({
					class: 'error',
					message: 'Error',
					displayTime: 5000,
					showProgress: 'top',
				});
				loadShowAutocompletes();
				return;
			}

			const body = await parseBody(res);
			if (!body) {
				return;
			}

			if (body.data.showCreated) {
				$('body').toast({
					class: 'info',
					message: 'Show created',
					displayTime: 5000,
					showProgress: 'top',
				});
			}
			if (body.data.videoCreated) {
				$('body').toast({
					class: 'info',
					message: 'Video created',
					displayTime: 5000,
					showProgress: 'top',
				});
			}

			document.getElementById('add-url').value = '';
			$('body').toast({
				class: 'success',
				message: `Link added<br><a class="ui inverted button" href="${body.data.videoLink}">Go to created link</a>`,
				displayTime: 5000,
				showProgress: 'top',
			});
			loadShowAutocompletes();
		}).catch(err => { // eslint-disable-line handle-callback-err
			$('body').toast({
				class: 'error',
				message: 'Network Error',
				displayTime: 5000,
				showProgress: 'top',
			});
			loadShowAutocompletes();
		});
	});
	// delete link
	document.getElementById('delete-link').addEventListener('click', function (evt) {
		const show = document.getElementById('delete-show').value;
		const episodes = document.getElementById('delete-episodes').value;
		const linkId = document.getElementById('delete-link-id').value;

		const urlShow = urlTransform(show);
		const urlEpisodes = urlTransform(episodes);

		fetch(`/api/links/${urlShow}/${urlEpisodes}/${linkId}`, {
			method: 'DELETE',
			credentials: 'same-origin',
		}).then(res => {
			// TODO better error check
			if (res.status !== 200) {
				$('body').toast({
					class: 'error',
					message: 'Error',
					displayTime: 5000,
					showProgress: 'top',
				});
				return;
			}
			$('body').toast({
				class: 'success',
				message: 'Link deleted',
				displayTime: 5000,
				showProgress: 'top',
			});
		}).catch(err => { // eslint-disable-line handle-callback-err
			$('body').toast({
				class: 'error',
				message: 'Network Error',
				displayTime: 5000,
				showProgress: 'top',
			});
		});
	});

	// delete show/episodes
	document.getElementById('edit-delete').addEventListener('click', function (evt) {
		const show = document.getElementById('edit-show').value.trim();
		const episodes = document.getElementById('edit-episodes').value.trim();

		const urlShow = urlTransform(show);
		const urlEpisodes = urlTransform(episodes);

		if (!show) {
			$('body').toast({
				class: 'error',
				message: 'Show can\'t be blank',
				displayTime: 5000,
				showProgress: 'top',
			});
			return;
		}

		let request;
		if (episodes) {
			request = fetch(`/api/${urlShow}/${urlEpisodes}`, {
				method: 'DELETE',
				credentials: 'same-origin',
			}).then(async res => {
				const body = await parseBody(res);
				if (!body) {
					return;
				}
				if (res.status === 404) {
					$('body').toast({
						class: 'warning',
						message: body.error[0].toUpperCase() + body.error.slice(1).toLowerCase(),
						displayTime: 5000,
						showProgress: 'top',
					});
					return;
				} else if (res.status === 400) {
					if (body.error.includes('not empty')) {
						$('body').toast({
							class: 'warning',
							message: 'Video must not contain links',
							displayTime: 5000,
							showProgress: 'top',
						});
						return;
					} else {
						$('body').toast({
							class: 'error',
							message: 'Bad request',
							displayTime: 5000,
							showProgress: 'top',
						});
						return;
					}
				} else if (res.status !== 200) {
					$('body').toast({
						class: 'error',
						message: 'Error',
						displayTime: 5000,
						showProgress: 'top',
					});
					return;
				}
				$('body').toast({
					class: 'success',
					message: 'Video deleted',
					displayTime: 5000,
					showProgress: 'top',
				});
				loadShowAutocompletes();
			});
		} else {
			request = fetch(`/api/${urlShow}`, {
				method: 'DELETE',
				credentials: 'same-origin',
			}).then(async res => {
				if (res.status === 404) {
					$('body').toast({
						class: 'warning',
						message: 'Show not found',
						displayTime: 5000,
						showProgress: 'top',
					});
					return;
				} else if (res.status === 400) {
					const body = await parseBody(res);
					if (!body) {
						return;
					}
					if (body.error.includes('not empty')) {
						$('body').toast({
							class: 'warning',
							message: 'Show must not contain episodes',
							displayTime: 5000,
							showProgress: 'top',
						});
						return;
					} else {
						$('body').toast({
							class: 'error',
							message: 'Bad request',
							displayTime: 5000,
							showProgress: 'top',
						});
						return;
					}
				} else if (res.status !== 200) {
					$('body').toast({
						class: 'error',
						message: 'Error',
						displayTime: 5000,
						showProgress: 'top',
					});
					return;
				}
				$('body').toast({
					class: 'success',
					message: 'Show deleted',
					displayTime: 5000,
					showProgress: 'top',
				});
				loadShowAutocompletes();
			});
		}

		request.catch(err => { // eslint-disable-line handle-callback-err
			$('body').toast({
				class: 'error',
				message: 'Network Error',
				displayTime: 5000,
				showProgress: 'top',
			});
			loadShowAutocompletes();
		});
	});

	// autocompletes
	$(document).ready(() => {
		loadShowAutocompletes();
	});

	$('.search-shows').find('input').on('blur', function (evt) {
		loadVideoAutocomplete(this);
	});

	function loadShowAutocompletes() {
		fetch(`/api/shows`, {
			method: 'GET',
			credentials: 'same-origin',
		}).then(async res => {
			// TODO better error check
			if (res.status !== 200) {
				$('body').toast({
					class: 'error',
					message: 'Error while loading show list',
					displayTime: 5000,
					showProgress: 'top',
				});
				return;
			}
			const body = await res.json();
			const data = body.map(e => ({title: e.name}));
			$('.search-shows').search({
				source: data,
				cache: false,
				showNoResults: false,
				ignoreDiacritics: true,
				onSelect: onAutocomplete,
			});
		}).catch(err => { // eslint-disable-line handle-callback-err
			$('body').toast({
				class: 'error',
				message: 'Network Error while loading show list',
				displayTime: 5000,
				showProgress: 'top',
			});
		});
	}

	function onAutocomplete() {
		loadVideoAutocomplete($(this).find('input')[0]);
	}

	function loadVideoAutocomplete(showInput) {
		const $videoSearch = $(document.getElementById(showInput.dataset.searchVideos));
		const urlShow = urlTransform(showInput.value);
		if (!urlShow) {
			return;
		}
		fetch(`/api/${urlShow}/videos`, {
			method: 'GET',
			credentials: 'same-origin',
		}).then(async res => {
			// TODO better error check
			if (res.status === 404) {
				$videoSearch.search({
					source: [],
					cache: false,
					showNoResults: false,
					ignoreDiacritics: true,
				});
				$videoSearch.search('search local', '');
				return;
			}
			if (res.status !== 200) {
				$('body').toast({
					class: 'error',
					message: 'Error while loading video list',
					displayTime: 5000,
					showProgress: 'top',
				});
				return;
			}
			const body = await res.json();
			const data = body.map(e => ({title: e.episodes}));
			$videoSearch.search({
				source: data,
				cache: false,
				showNoResults: false,
				ignoreDiacritics: true,
			});
		}).catch(err => { // eslint-disable-line handle-callback-err
			$('body').toast({
				class: 'error',
				message: 'Network Error while loading video list',
				displayTime: 5000,
				showProgress: 'top',
			});
		});
	}

	function urlTransform(value) {
		return value.replace(/ /g, '_').replace(/'/g, '');
	}

	async function parseBody(response) {
		let body;
		try {
			body = await response.json();
		} catch (err) {
			$('body').toast({
				class: 'error',
				message: 'Error while parsing response',
				displayTime: 5000,
				showProgress: 'top',
			});
		}
		return body;
	}
})();
