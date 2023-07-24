import { AlarmName } from '../types/enums';
import { MatchSync } from './match-sync';

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
}

const singleton = new BackgroundSync();

export {
	singleton as BackgroundSync,
};
