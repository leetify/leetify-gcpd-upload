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
