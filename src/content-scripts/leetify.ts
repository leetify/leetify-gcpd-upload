import { EventName } from '../../types/enums';

const accessToken = localStorage.getItem('access_token');

chrome.runtime.sendMessage({
	event: EventName.LEETIFY_ACCESS_TOKEN,
	data: { accessToken },
});
