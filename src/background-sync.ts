// This module handles the automatic sync on an interval in the background.

import { AlarmName, SyncStorageKey } from '../types/enums';
import { MatchSync } from './match-sync';
import { getOptionDefaults } from './constants';

class BackgroundSync {
	public async setAlarm(): Promise<void> {
		await chrome.alarms.create(AlarmName.BACKGROUND_SYNC, {
			delayInMinutes: 1,
			periodInMinutes: 15,
		});
	}

	public async unsetAlarm(): Promise<void> {
		await chrome.alarms.clear(AlarmName.BACKGROUND_SYNC);
	}

	public async handleAlarm(): Promise<void> {
		await MatchSync.run();
	}

	public async shouldRunOnInterval(): Promise<boolean> {
		const { [SyncStorageKey.OPTION_SYNC_ON_INTERVAL]: shouldRun } = await chrome.storage.sync.get(SyncStorageKey.OPTION_SYNC_ON_INTERVAL);

		return shouldRun ?? getOptionDefaults()[SyncStorageKey.OPTION_SYNC_ON_INTERVAL];
	}
}

const singleton = new BackgroundSync();

export {
	singleton as BackgroundSync,
};
