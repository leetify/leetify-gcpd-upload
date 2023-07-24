import { AlarmName, EventName, SyncStorageKey } from '../types/enums';
import { isOptionUpdatedEventBody, isRuntimeMessage } from '../types/interfaces';
import { BackgroundSync } from './background-sync';
import { MatchSync } from './match-sync';
import { SyncForegroundTab } from './sync-foreground-tab';
import { SyncOnPageVisit } from './sync-on-page-visit';
import { stripFrameOptionsHeadersFromLeetifyRequests } from './helpers/strip-frame-options-headers-from-leetify-requests';

const onStartupOrInstalled = async (): Promise<void> => {
	// TODO make sure this doesn't cause duplicates
	await stripFrameOptionsHeadersFromLeetifyRequests();
	await SyncOnPageVisit.applyListener();

	// TODO make sure this doesn't cause duplicates
	if (await BackgroundSync.shouldRunOnInterval()) {
		await BackgroundSync.setAlarm();
	}
};

chrome.runtime.onStartup.addListener(() => onStartupOrInstalled());
chrome.runtime.onInstalled.addListener(() => onStartupOrInstalled());

chrome.action.onClicked.addListener(async (): Promise<void> => {
	await SyncForegroundTab.openOrFocus();
	await MatchSync.run();
});

chrome.alarms.onAlarm.addListener(async (alarm): Promise<void> => {
	switch (alarm.name) {
		case AlarmName.BACKGROUND_SYNC: return BackgroundSync.handleAlarm();
	}
});

const handleOptionUpdated = async (data: Record<string, any>): Promise<void> => {
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
};

const handleRequestMatchSync = async (): Promise<void> => {
	await MatchSync.run();
};

chrome.runtime.onMessage.addListener((message, sender): any => {
	if (sender.id !== chrome.runtime.id) return;
	if (!isRuntimeMessage(message)) return;

	switch (message.event) {
		case EventName.OPTION_UPDATED: return handleOptionUpdated(message.data);
		case EventName.REQUEST_MATCH_SYNC: return handleRequestMatchSync();
	}
});
