/* global M */
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
		}).catch(err => { // eslint-disable-line handle-callback-err
			M.toast({html: 'Network Error'});
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
			}).catch(err => { // eslint-disable-line handle-callback-err
				M.toast({html: 'Network Error'});
			});
		});
	}

	// import links
	// TODO support for switches
	document.getElementById('import').addEventListener('click', async function (evt) {
		const file = document.getElementById('data-file').files[0];
		if (!file) {
			return;
		}
		fetch(`/api/import/links`, {
			method: 'POST',
			credentials: 'same-origin',
			headers: {
				'Content-Type': 'application/json',
			},
			body: file,
		}).then(res => {
			// TODO better error check
			if (res.status !== 200) {
				M.toast({html: 'Error'});
				return;
			}
			M.toast({html: 'Success'});
		}).catch(err => { // eslint-disable-line handle-callback-err
			M.toast({html: 'Network Error'});
		});
	});
})();
