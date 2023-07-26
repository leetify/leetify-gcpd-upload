// This is the main Service Worker. It mostly just serves as an entry point,
// and delegates incoming events.

import { Action } from './action';
import { AlarmName, EventName } from '../types/enums';
import { BackgroundSync } from './background-sync';
import { isRuntimeMessage } from '../types/interfaces';
import { LeetifyAccessToken } from './leetify-access-token';
import { MatchSync } from './match-sync';
import { Options } from './options';
import { SyncOnPageVisit } from './sync-on-page-visit';

const onStartupOrInstalled = async (): Promise<void> => {
	await SyncOnPageVisit.applyListener();

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

chrome.runtime.onMessage.addListener((message, sender): any => {
	if (sender.id !== chrome.runtime.id) return;
	if (!isRuntimeMessage(message)) return;

	switch (message.event) {
		case EventName.LEETIFY_ACCESS_TOKEN: return LeetifyAccessToken.handleLeetifyAccessTokenEvent(message.data);
		case EventName.OPTION_UPDATED: return Options.handleOptionUpdatedEvent(message.data);
		case EventName.REQUEST_MATCH_SYNC: return MatchSync.handleRequestMatchSyncEvent();
		case EventName.REQUEST_SYNC_STATUS: return MatchSync.handleRequestSyncStatusEvent();
	}
});
