import { Action } from './action';
import { AlarmName, EventName, SyncStorageKey } from '../types/enums';
import { BackgroundSync } from './background-sync';
import { isOptionUpdatedEventBody, isRuntimeMessage } from '../types/interfaces';
import { LeetifyAccessToken } from './leetify-access-token';
import { MatchSync } from './match-sync';
import { SyncOnPageVisit } from './sync-on-page-visit';

const onStartupOrInstalled = async (): Promise<void> => {
	// TODO make sure this doesn't cause duplicates
	await SyncOnPageVisit.applyListener();

	// TODO make sure this doesn't cause duplicates
	if (await BackgroundSync.shouldRunOnInterval()) {
		await BackgroundSync.setAlarm();
	}
};

chrome.runtime.onStartup.addListener(() => onStartupOrInstalled());

chrome.runtime.onInstalled.addListener(async () => {
	await Promise.all([
		chrome.runtime.openOptionsPage(),
		MatchSync.run(),
		onStartupOrInstalled(),
	]);
});

chrome.action.onClicked.addListener(() => Action.handleClick());

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

chrome.runtime.onMessage.addListener((message, sender): any => {
	if (sender.id !== chrome.runtime.id) return;
	if (!isRuntimeMessage(message)) return;

	switch (message.event) {
		case EventName.LEETIFY_ACCESS_TOKEN: return LeetifyAccessToken.handleLeetifyAccessTokenEvent(message.data);
		case EventName.OPTION_UPDATED: return handleOptionUpdated(message.data);
		case EventName.REQUEST_MATCH_SYNC: return MatchSync.handleRequestMatchSyncEvent();
		case EventName.REQUEST_SYNC_STATUS: return MatchSync.handleRequestSyncStatusEvent();
	}
});
