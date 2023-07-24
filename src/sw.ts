import { AlarmName } from '../types/enums';
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
