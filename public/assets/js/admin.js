(function () {
	// add uploader
	document.getElementById('add-uploader').addEventListener('click', function (evt) {
		const uploaderId = document.getElementById('new-uploader').value;
		fetch(`/api/uploaders`, {
			method: 'POST',
			credentials: 'same-origin',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({userId: uploaderId}),
		}).then(res => {
			// TODO check status
			// TODO display error
			location.reload(true);
		}).catch(err => {
			// TODO display error
		});
	});

	// delete uploader
	const deleteButtons = document.querySelectorAll('button.delete-uploader');
	for (let i = 0; i < deleteButtons.length; ++i) {
		deleteButtons[i].addEventListener('click', function (evt) {
			fetch(`/api/uploaders/${this.dataset.id}`, {
				method: 'DELETE',
				credentials: 'same-origin',
			}).then(res => {
				// TODO check status
				// TODO display error
				this.parentElement.remove();
			}).catch(err => {
				// TODO display error
			});
		});
	}
})();
