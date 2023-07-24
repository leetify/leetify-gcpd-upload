import { EventName } from '../../types/enums';

(async () => {
	if (window.location.toString() !== 'https://leetify.test/gcpd-extension-auth') return;

	document.write('');

	await chrome.runtime.sendMessage({
		event: EventName.LEETIFY_ACCESS_TOKEN,

		data: {
			accessToken: localStorage.getItem('access_token'),
		},
	});

	window.close();
})();
