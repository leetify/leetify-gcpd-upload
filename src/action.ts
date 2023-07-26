// This module handles everything related to the "action", i.e. the extension
// icon in Chrome's toolbar. Namely, clicking on it to open the foreground page,
// and displaying a badge when something went wrong during a sync.

import { MatchSync } from './match-sync';
import { SyncStatus } from '../types/enums';
import { ViewTab } from './view-tab';

class Action {
	public async handleClick(): Promise<void> {
		await Promise.all([
			ViewTab.openOrFocus(),
			MatchSync.run(),
		]);
	}

	public async setBadgeFromSyncStatus(syncStatus: SyncStatus): Promise<void> {
		switch (syncStatus) {
			case SyncStatus.LEETIFY_AUTH_FAILED:
			case SyncStatus.STEAM_AUTH_FAILED:
				await Promise.all([
					chrome.action.setBadgeBackgroundColor({ color: '#de425b' }),
					chrome.action.setBadgeText({ text: 'ERR' }),
					chrome.action.setBadgeTextColor({ color: '#000' }),
				]);
				return;

			case SyncStatus.INVALID_GCPD_RESPONSE:
			case SyncStatus.UPLOADING_TO_LEETIFY_FAILED:
				await Promise.all([
					chrome.action.setBadgeBackgroundColor({ color: '#fb9d5a' }),
					chrome.action.setBadgeText({ text: 'fail' }),
					chrome.action.setBadgeTextColor({ color: '#000' }),
				]);
				return;

			default:
				await chrome.action.setBadgeText({ text: '' });

		}
	}
}

const singleton = new Action();

export {
	singleton as Action,
};
