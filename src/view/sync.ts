import { EventName, GcpdTab, StatusIcon, SyncStatus } from '../../types/enums';
import { isRuntimeMessage, isSyncStatusEventBody, SyncStatusEventBody } from '../../types/interfaces';

export class Sync {
	protected readonly statusIconElement = document.querySelector('#status-icon') as HTMLImageElement | null;
	protected readonly statusMessageElement = document.querySelector('#status-message') as HTMLElement | null;
	protected readonly triggerSyncButton = document.querySelector('button#trigger-sync');

	public constructor() {
		this.initTriggerSyncButton();
		this.setupListeners();

		this.requestSyncStatus();
	}

	protected initTriggerSyncButton(): void {
		if (!this.triggerSyncButton) return;
		this.triggerSyncButton.addEventListener('click', () => chrome.runtime.sendMessage({ event: EventName.REQUEST_MATCH_SYNC }));
	}

	protected requestSyncStatus(): void {
		chrome.runtime.sendMessage(({ event: EventName.REQUEST_SYNC_STATUS }));
	}

	protected setupListeners(): void {
		chrome.runtime.onMessage.addListener((message, sender): any => {
			if (sender.id !== chrome.runtime.id) return;
			if (!isRuntimeMessage(message)) return;

			switch (message.event) {
				case EventName.SYNC_STATUS: return this.handleSyncStatus(message.data);
			}
		});
	}

	protected handleSyncStatus(data: Record<string, any>): void {
		if (!isSyncStatusEventBody(data)) return;

		console.info(new Date().toJSON(), '[SyncStatus]', JSON.stringify(data));

		if (this.statusMessageElement) {
			this.statusMessageElement.innerText = this.getStatusMessage(data);
		}

		if (this.statusIconElement) {
			const statusIcon = this.getStatusIcon(data);
			switch (statusIcon) {
				case StatusIcon.SPINNER: {
					this.statusIconElement.src = '/assets/spinner.svg';
					this.statusIconElement.classList.add('spinner');
					break;
				}

				default: {
					this.statusIconElement.src = `/assets/icons/${statusIcon}.svg`;
					this.statusIconElement.classList.remove('spinner');
					break;
				}
			}
		}
	}

	protected getStatusIcon(data: SyncStatusEventBody): StatusIcon {
		switch (data.status) {
			case SyncStatus.DONE: return StatusIcon.CHECK;
			case SyncStatus.IDLE: return StatusIcon.DOTS_HORIZONTAL;

			case SyncStatus.INVALID_GCPD_RESPONSE:
			case SyncStatus.LEETIFY_AUTH_FAILED:
			case SyncStatus.STEAM_AUTH_FAILED:
			case SyncStatus.UPLOADING_TO_LEETIFY_FAILED:
				return StatusIcon.ALERT_CIRCLE;

			case SyncStatus.BEGINNING_SYNC:
			case SyncStatus.FINISHED_GCPD:
			case SyncStatus.FINISHED_SYNC:
			case SyncStatus.GCPD_PARSER_INITIALIZED:
			case SyncStatus.GCPD_PARSER_INITIALIZING:
			case SyncStatus.LEETIFY_AUTH_SUCCESSFUL:
			case SyncStatus.REQUESTING_GCPD_PAGE:
			case SyncStatus.UPLOADING_TO_LEETIFY:
			case SyncStatus.WAITING_FOR_LEETIFY_AUTH:
				return StatusIcon.SPINNER;
		}
	}

	protected getStatusMessage(data: SyncStatusEventBody): string {
		switch (data.status) {
			case SyncStatus.BEGINNING_SYNC: return `Requesting matches from Steam... (${data.tab === GcpdTab.WINGMAN ? 'Wingman' : 'Unranked 5v5'})`;
			case SyncStatus.FINISHED_GCPD: return `Received ${data.found === 1 ? 'one match' : `${data.found} matches`} from Steam.`;
			case SyncStatus.FINISHED_SYNC: return `Synchronized ${data.tab === GcpdTab.WINGMAN ? 'Wingman' : 'Unranked 5v5'} matches.`;
			case SyncStatus.GCPD_PARSER_INITIALIZED: return 'Steam GCPD response handler prepared.';
			case SyncStatus.GCPD_PARSER_INITIALIZING: return 'Preparing Steam GCPD response handler...';
			case SyncStatus.IDLE: return 'Idle. Press the button to sync your matches.';
			case SyncStatus.INVALID_GCPD_RESPONSE: return 'Something went wrong (GCPD). Please make sure you\'re logged in to Steam.';
			case SyncStatus.LEETIFY_AUTH_FAILED: return 'Could not authenticate with Leetify. Please make sure you\'re logged in.';
			case SyncStatus.LEETIFY_AUTH_SUCCESSFUL: return 'Logged in to Leetify.';
			case SyncStatus.REQUESTING_GCPD_PAGE: return `Requesting matches from Steam... (Iteration ${data.depth} of up to 16)`;
			case SyncStatus.STEAM_AUTH_FAILED: return 'Could not authenticate with Steam. Please make sure you\'re logged in.';
			case SyncStatus.UPLOADING_TO_LEETIFY_FAILED: return 'Could not upload matches to Leetify :(';
			case SyncStatus.UPLOADING_TO_LEETIFY: return 'Uploading matches to Leetify...';
			case SyncStatus.WAITING_FOR_LEETIFY_AUTH: return 'Logging in to Leetify...';

			case SyncStatus.DONE: {
				const now = new Date();
				const f = (n: number): string => n.toString().padStart(2, '0');
				return `Done at ${f(now.getHours())}:${f(now.getMinutes())}:${f(now.getSeconds())}.`;
			}
		}
	}
}
