import { EventName, GcpdTab } from '../types/enums';
import { isRuntimeMessage } from '../types/interfaces';
import { LeetifyAccessToken } from './leetify-access-token';
import { Gcpd } from './gcpd';
import { syncStorageKey } from './helpers/sync-storage-key';

chrome.runtime.onStartup.addListener(() => LeetifyAccessToken.tryToFetchLeetifyAccessToken());
chrome.runtime.onInstalled.addListener(() => LeetifyAccessToken.tryToFetchLeetifyAccessToken());

const syncMatches = async (tab: GcpdTab): Promise<void> => {
	const leetifyAccessToken = await LeetifyAccessToken.getToken();
	if (!leetifyAccessToken) return;

	const matches = await Gcpd.fetchAllMatches(tab);
	if (!matches.length) return;

	const response = await fetch('https://api.leetify.test/api/upload-from-url', { // TODO
		method: 'POST',
		body: JSON.stringify({ matches }),

		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${leetifyAccessToken}`,
		},
	});

	if (response.status !== 204) return;

	await chrome.storage.sync.set({
		[syncStorageKey(tab)]: matches[0].timestamp,
	});
}

chrome.action.onClicked.addListener(async (tab) => {
	await syncMatches(GcpdTab.SCRIMMAGE);
	await syncMatches(GcpdTab.WINGMAN);
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse): any => {
	if (sender.id !== chrome.runtime.id) return; // message was not sent from our extension
	if (!isRuntimeMessage(message)) return;

	switch (message.event) {
		case EventName.LEETIFY_ACCESS_TOKEN: return LeetifyAccessToken.handleEvent(message.data);
	}
});
