import { EventName, GcpdTab, SyncStatus } from '../../types/enums';
import { isRuntimeMessage, isSyncStatusEventBody, SyncStatusEventBody } from '../../types/interfaces';

const getFriendlyStatus = (data: SyncStatusEventBody): string => {
	switch (data.status) {
		case SyncStatus.BEGINNING_SYNC: return `Requesting games from Steam... (${data.tab === GcpdTab.WINGMAN ? 'Wingman' : 'Unranked 5v5'})`;
		case SyncStatus.DONE: return 'Done.';
		case SyncStatus.FINISHED_GCPD: return `Received ${data.found === 1 ? 'one match' : `${data.found} matches`} from Steam.`;
		case SyncStatus.FINISHED_SYNC: return `Synchronized ${data.tab === GcpdTab.WINGMAN ? 'Wingman' : 'Unranked 5v5'} matches.`;
		case SyncStatus.GCPD_PARSER_INITIALIZED: return 'Steam GCPD response handler prepared.';
		case SyncStatus.GCPD_PARSER_INITIALIZING: return 'Preparing Steam GCPD response handler...';
		case SyncStatus.LEETIFY_AUTH_FAILED: return 'Could not authenticate with Leetify. Please make sure you\'re logged in.';
		case SyncStatus.LEETIFY_AUTH_SUCCESSFUL: return 'Logged in to Leetify.';
		case SyncStatus.REQUESTING_GCPD_PAGE: return `Requesting games from Steam... (Iteration ${data.depth} of up to 16)`;
		case SyncStatus.UPLOADING_TO_LEETIFY_FAILED: return 'Could not upload matches to Leetify :(';
		case SyncStatus.UPLOADING_TO_LEETIFY: return 'Uploading matches to Leetify...';
		case SyncStatus.WAITING_FOR_LEETIFY_AUTH: return 'Logging in to Leetify...';
	}
};

const handleSyncStatus = (data: Record<string, any>): void => {
	if (!isSyncStatusEventBody(data)) return;
	const log = document.querySelector('#log') as HTMLElement;

	const div = document.createElement('div');
	div.innerText = new Date() + ' ' + JSON.stringify(data);
	log.appendChild(div);

	const friendlyStatusElement = document.querySelector('#friendly-status') as HTMLElement;
	friendlyStatusElement.innerText = getFriendlyStatus(data);
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
