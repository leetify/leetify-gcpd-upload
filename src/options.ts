import { BackgroundSync } from './background-sync';
import { isOptionUpdatedEventBody } from '../types/interfaces';
import { SyncOnPageVisit } from './sync-on-page-visit';
import { SyncStorageKey } from '../types/enums';

class Options {
	public async handleOptionUpdatedEvent(data: Record<string, any>): Promise<void> {
		if (!isOptionUpdatedEventBody(data)) return;

		switch (data.key) {
			case SyncStorageKey.OPTION_SYNC_ON_INTERVAL: {
				if (data.value) return BackgroundSync.setAlarm();
				return BackgroundSync.unsetAlarm();
			}

			case SyncStorageKey.OPTION_SYNC_ON_VISIT_GCPD: {
				SyncOnPageVisit.updateSyncOnVisitGcpdCache(data.value);
				await SyncOnPageVisit.applyListener();
				break;
			}

			case SyncStorageKey.OPTION_SYNC_ON_VISIT_LEETIFY: {
				SyncOnPageVisit.updateSyncOnVisitLeetifyCache(data.value);
				await SyncOnPageVisit.applyListener();
				break;
			}

			case SyncStorageKey.OPTION_SYNC_RANKED_WINGMAN: {
				if (!data.value) return; // when a data source gets disabled, we don't have to do anything
				return chrome.storage.sync.remove(SyncStorageKey.FOUND_MATCH_TIMESTAMP_WINGMAN); // when this gets enabled, clear the timestamp so we can get earlier matches
			}

			case SyncStorageKey.OPTION_SYNC_UNRANKED_WINGMAN: {
				if (!data.value) return; // when a data source gets disabled, we don't have to do anything
				return chrome.storage.sync.remove(SyncStorageKey.FOUND_MATCH_TIMESTAMP_WINGMAN); // when this gets enabled, clear the timestamp so we can get earlier matches
			}
		}
	}
}

const singleton = new Options();

export {
	singleton as Options,
};
