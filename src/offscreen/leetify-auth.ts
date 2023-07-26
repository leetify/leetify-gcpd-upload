// This offscreen page will be opened by the Service Worker during a sync.
// It'll only create an iframe of the Leetify GCPD extension auth page, and
// attach it to the offscreen page DOM. The page within that iframe has a
// content script embedded, which will read the Leetify access token, and
// send it to the Service Worker.

import { LEETIFY_FRONTEND_URL } from '../constants';

(() => {
	const iframe = document.createElement('iframe');
	iframe.src = `${LEETIFY_FRONTEND_URL}/gcpd-extension-auth`;
	document.body.appendChild(iframe);
})();
