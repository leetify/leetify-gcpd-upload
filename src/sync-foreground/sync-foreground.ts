import { EventName } from '../../types/enums';
import { isRuntimeMessage, isSyncStatusEventBody } from '../../types/interfaces';

const handleSyncStatus = (data: Record<string, any>): void => {
	if (!isSyncStatusEventBody(data)) return;
	const log = document.querySelector('#log') as HTMLElement;

	const div = document.createElement('div');
	div.innerText = new Date() + ' ' + JSON.stringify(data);
	log.appendChild(div);
};

chrome.runtime.onMessage.addListener((message, sender, sendResponse): any => {
	console.log('from sync foreground', message);

	if (sender.id !== chrome.runtime.id) return;
	if (!isRuntimeMessage(message)) return;

	switch (message.event) {
		case EventName.SYNC_STATUS: return handleSyncStatus(message.data);
	}

	return false;
});

chrome.runtime.sendMessage(({ event: EventName.REQUEST_SYNC_STATUS }));
