import { GcpdTab } from '../../types/enums';
import { LeetifyAccessToken } from '../leetify-access-token';
import { Gcpd } from '../gcpd';
import { syncStorageKey } from '../helpers/sync-storage-key';

export const syncMatches = async (tab: GcpdTab): Promise<void> => {
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
};

export const syncAllMatches = async (): Promise<void> => {
	await syncMatches(GcpdTab.SCRIMMAGE);
	await syncMatches(GcpdTab.WINGMAN);
};
