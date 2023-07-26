// This content script is injected into https://leetify.com/gcpd-extension-auth,
// which is loaded as an iframe during a sync.
// This script will read the Leetify access token from localStorage (or null if
// the user isn't logged in), and send it to the Service Worker, which will
// then use it for uploading matches to Leetify.

import { EventName } from '../../types/enums';
import { LEETIFY_FRONTEND_URL } from '../constants';

(async () => {
	if (window.location.toString() !== `${LEETIFY_FRONTEND_URL}/gcpd-extension-auth`) return;

	await chrome.runtime.sendMessage({
		event: EventName.LEETIFY_ACCESS_TOKEN,

		data: {
			accessToken: localStorage.getItem('access_token'),
		},
	});

	window.close();
})();
