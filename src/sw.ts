import { AlarmName, EventName, SyncStorageKey } from '../types/enums';
import { isOptionUpdatedEventBody, isRuntimeMessage } from '../types/interfaces';
import { BackgroundSync } from './background-sync';
import { MatchSync } from './match-sync';
import { SyncForegroundTab } from './sync-foreground-tab';

const onStartupOrInstalled = async (): Promise<void> => {
	await BackgroundSync.setAlarm();
	await stripFrameOptionsHeadersFromLeetifyRequests();
};

// TODO make sure this only applies within the extension
const stripFrameOptionsHeadersFromLeetifyRequests = async (): Promise<void> => {
	const rule: chrome.declarativeNetRequest.Rule = {
		id: 1,

		condition: {
			initiatorDomains: [chrome.runtime.id],
			requestDomains: ['leetify.test'],
			resourceTypes: ['sub_frame'],
		},

		action: {
			type: 'modifyHeaders',

			responseHeaders: [
				{ header: 'X-Frame-Options', operation: 'remove' },
				{ header: 'Frame-Options', operation: 'remove' },
			],
		},
	};

	await chrome.declarativeNetRequest.updateDynamicRules({
		removeRuleIds: [rule.id],
		addRules: [rule],
	});
};

chrome.runtime.onStartup.addListener(() => onStartupOrInstalled());
chrome.runtime.onInstalled.addListener(() => onStartupOrInstalled());

chrome.action.onClicked.addListener(async (tab): Promise<void> => {
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
			// TODO clear or set alarm
			break;
		}

		case SyncStorageKey.OPTION_SYNC_ON_VISIT_GCPD: {
			// TODO enable/disable listener
			break;
		}

		case SyncStorageKey.OPTION_SYNC_ON_VISIT_LEETIFY: {
			// TODO enable/disable listener
			break;
		}

		case SyncStorageKey.OPTION_SYNC_RANKED_WINGMAN: {
			if (!data.value) return; // when a data source gets disabled, we don't have to do anything
			return await chrome.storage.sync.remove(SyncStorageKey.FOUND_MATCH_TIMESTAMP_WINGMAN); // when this gets enabled, clear the timestamp so we can get earlier matches
		}

		case SyncStorageKey.OPTION_SYNC_UNRANKED_WINGMAN: {
			if (!data.value) return; // when a data source gets disabled, we don't have to do anything
			return await chrome.storage.sync.remove(SyncStorageKey.FOUND_MATCH_TIMESTAMP_WINGMAN); // when this gets enabled, clear the timestamp so we can get earlier matches
		}
	}
};

chrome.runtime.onMessage.addListener((message, sender): any => {
	if (sender.id !== chrome.runtime.id) return;
	if (!isRuntimeMessage(message)) return;

	switch (message.event) {
		case EventName.OPTION_UPDATED: return handleOptionUpdated(message.data);
	}
});
