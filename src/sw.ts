import { AlarmName, EventName } from '../types/enums';
import { isRuntimeMessage } from '../types/interfaces';
import { LeetifyAccessToken } from './leetify-access-token';
import { BackgroundSync } from './background-sync';
import { syncAllMatches } from './helpers/sync-matches';

const onStartupOrInstalled = async (): Promise<void> => {
	await LeetifyAccessToken.tryToFetchLeetifyAccessToken();
	await BackgroundSync.setAlarm();
};

chrome.runtime.onStartup.addListener(() => onStartupOrInstalled());
chrome.runtime.onInstalled.addListener(() => onStartupOrInstalled());

chrome.action.onClicked.addListener(async (tab) => {
	await syncAllMatches();
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse): any => {
	if (sender.id !== chrome.runtime.id) return; // message was not sent from our extension
	if (!isRuntimeMessage(message)) return;

	switch (message.event) {
		case EventName.LEETIFY_ACCESS_TOKEN: return LeetifyAccessToken.handleEvent(message.data);
	}
});

chrome.alarms.onAlarm.addListener(async (alarm) => {
	switch (alarm.name) {
		case AlarmName.BACKGROUND_SYNC: return BackgroundSync.handleAlarm();
	}
});
