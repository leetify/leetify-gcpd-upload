import { LEETIFY_FRONTEND_URL } from '../constants';

(() => {
	const iframe = document.createElement('iframe');
	iframe.src = `${LEETIFY_FRONTEND_URL}/gcpd-extension-auth`;
	document.body.appendChild(iframe);
})();
