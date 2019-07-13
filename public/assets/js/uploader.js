/* global M */
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
		}).then(res => {
			// TODO better error check
			if (res.status !== 200) {
				M.toast({html: 'Error'});
				loadShowAutocompletes();
				return;
			}
			// TODO feedback if show/video was created
			document.getElementById('add-url').value = '';
			M.toast({html: 'Link added'});
			loadShowAutocompletes();
		}).catch(err => { // eslint-disable-line handle-callback-err
			M.toast({html: 'Network Error'});
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
				M.toast({html: 'Error'});
				return;
			}
			M.toast({html: 'Link deleted'});
		}).catch(err => { // eslint-disable-line handle-callback-err
			M.toast({html: 'Network Error'});
		});
	});

	// autocompletes
	const showAutocompletes = M.Autocomplete.init(document.querySelectorAll('.autocomplete-shows'), {onAutocomplete: onAutocomplete});
	M.Autocomplete.init(document.querySelectorAll('.autocomplete-videos'), {});

	showAutocompletes.forEach(e => {
		e.el.addEventListener('blur', function (evt) {
			loadVideoAutocomplete(this);
		});
	});
	loadShowAutocompletes();

	function loadShowAutocompletes() {
		fetch(`/api/shows`, {
			method: 'GET',
			credentials: 'same-origin',
		}).then(async res => {
			// TODO better error check
			if (res.status !== 200) {
				M.toast({html: 'Error while loading show list'});
				return;
			}
			const body = await res.json();
			const data = {};
			body.forEach(e => {
				data[e.name] = null;
			});
			showAutocompletes.forEach(e => {
				e.updateData(data);
			});
		}).catch(err => { // eslint-disable-line handle-callback-err
			M.toast({html: 'Network Error while loading show list'});
		});
	}

	function onAutocomplete() {
		loadVideoAutocomplete(this.el);
	}

	function loadVideoAutocomplete(showInput) {
		const videoAutocomplete = M.Autocomplete.getInstance(document.getElementById(showInput.dataset.autocompleteVideos));
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
				return;
			}
			if (res.status !== 200) {
				M.toast({html: 'Error while loading video list'});
				return;
			}
			const body = await res.json();
			const data = {};
			body.forEach(e => {
				data[e.episodes] = null;
			});
			videoAutocomplete.updateData(data);
		}).catch(err => { // eslint-disable-line handle-callback-err
			M.toast({html: 'Network Error while loading video list'});
		});
	}

	function urlTransform(value) {
		return value.replace(/ /g, '_').replace(/'/g, '');
	}
})();
