const accessToken = localStorage.getItem('access_token');

if (accessToken) {
	chrome.runtime.sendMessage({
		event: 'leetify_access_token',
		data: { accessToken },
	});
}
