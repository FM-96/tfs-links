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
			// TODO check status
			// TODO display error
			// TODO feedback if show/video was created
			loadShowAutocompletes();
		}).catch(err => {
			// TODO display error
		});
	});
	// delete link
	document.getElementById('delete-link').addEventListener('click', function (evt) {
		const show = document.getElementById('delete-show').value;
		const episodes = document.getElementById('delete-episodes').value;
		const linkId = document.getElementById('delete-link-id').value;

		const urlShow = show.replace(/ /g, '_'); // TODO
		const urlEpisodes = episodes.replace(/ /g, '_'); // TODO

		fetch(`/api/links/${urlShow}/${urlEpisodes}/${linkId}`, {
			method: 'DELETE',
			credentials: 'same-origin',
		}).then(res => {
			// TODO check status
			// TODO display error
		}).catch(err => {
			// TODO display error
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
			// TODO check status
			// TODO display error
			const body = await res.json();
			const data = {};
			body.forEach(e => {
				data[e.name] = null;
			});
			showAutocompletes.forEach(e => {
				e.updateData(data);
			});
		}).catch(err => {
			// TODO display error
		});
	}

	function onAutocomplete() {
		loadVideoAutocomplete(this.el);
	}

	function loadVideoAutocomplete(showInput) {
		const videoAutocomplete = M.Autocomplete.getInstance(document.getElementById(showInput.dataset.autocompleteVideos));
		const urlShow = showInput.value.replace(/ /g, '_'); // TODO
		if (!urlShow) {
			return;
		}
		fetch(`/api/${urlShow}/videos`, {
			method: 'GET',
			credentials: 'same-origin',
		}).then(async res => {
			// TODO check status
			if (res.status === 404) {
				return;
			}
			// TODO display error
			const body = await res.json();
			const data = {};
			body.forEach(e => {
				data[e.episodes] = null;
			});
			videoAutocomplete.updateData(data);
		}).catch(err => {
			// TODO display error
		});
	}
})();
