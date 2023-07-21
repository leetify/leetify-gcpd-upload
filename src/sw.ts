import { EventName } from '../types/enums';
import { isRuntimeMessage } from '../types/interfaces';
import { LeetifyAccessToken } from './leetify-access-token';
import { Gcpd } from './gcpd';

chrome.runtime.onStartup.addListener(() => LeetifyAccessToken.tryToFetchLeetifyAccessToken());
chrome.runtime.onInstalled.addListener(() => LeetifyAccessToken.tryToFetchLeetifyAccessToken());

chrome.action.onClicked.addListener(async (tab) => {
	const matches = await Gcpd.fetchAllMatches('matchhistorywingman');
	console.log('matches', matches)
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse): any => {
	if (sender.id !== chrome.runtime.id) return; // message was not sent from our extension
	if (!isRuntimeMessage(message)) return;

	switch (message.event) {
		case EventName.LEETIFY_ACCESS_TOKEN: return LeetifyAccessToken.handleEvent(message.data);
	}
});
