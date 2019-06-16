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
})();
