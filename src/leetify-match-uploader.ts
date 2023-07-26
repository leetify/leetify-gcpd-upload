// This module sends matches to Leetify's API. It also retrieves and updates
// the timestamp of the last match we found (saved locally to avoid sending the
// same match to Leetify multiple times).

import { GcpdMatch } from '../types/interfaces';
import { GcpdTab, SyncStatus, SyncStorageKey } from '../types/enums';
import { MatchSync } from './match-sync';
import { LEETIFY_API_URL } from './constants';

class LeetifyMatchUploader {
	public async uploadMatches(matches: GcpdMatch[], tab: GcpdTab, leetifyAccessToken: string): Promise<boolean> {
		await MatchSync.setStatus({ status: SyncStatus.UPLOADING_TO_LEETIFY });

		const response = await fetch(`${LEETIFY_API_URL}/api/upload-from-url`, {
			method: 'POST',
			body: this.buildRequestBody(matches),

			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${leetifyAccessToken}`,
			},
		});

		if (response.status !== 204) {
			await MatchSync.setStatus({ status: SyncStatus.UPLOADING_TO_LEETIFY_FAILED });
			return false;
		}

		await this.savePreviouslyFoundMatchTimestamp(tab, matches[0]);

		await MatchSync.setStatus({ tab, status: SyncStatus.FINISHED_SYNC });

		return true;
	}

	public async getPreviouslyFoundMatchTimestamp(tab: GcpdTab): Promise<string | undefined> {
		const previouslyFoundMatchTimestampKey = this.syncStorageKeyForTab(tab);
		const items = await chrome.storage.sync.get(previouslyFoundMatchTimestampKey);
		return items[previouslyFoundMatchTimestampKey];
	}

	protected async savePreviouslyFoundMatchTimestamp(tab: GcpdTab, match: GcpdMatch): Promise<void> {
		await chrome.storage.sync.set({
			[this.syncStorageKeyForTab(tab)]: match.timestamp,
		});
	}

	protected buildRequestBody(matches: GcpdMatch[]): string {
		return JSON.stringify({
			matches: matches.map((match) => ({
				url: match.url,
				timestamp: match.timestamp,
			})),
		});
	}

	protected syncStorageKeyForTab(tab: GcpdTab): SyncStorageKey.FOUND_MATCH_TIMESTAMP_SCRIMMAGE | SyncStorageKey.FOUND_MATCH_TIMESTAMP_WINGMAN {
		switch (tab) {
			case GcpdTab.SCRIMMAGE: return SyncStorageKey.FOUND_MATCH_TIMESTAMP_SCRIMMAGE;
			case GcpdTab.WINGMAN: return SyncStorageKey.FOUND_MATCH_TIMESTAMP_WINGMAN;
		}
	}
}

const singleton = new LeetifyMatchUploader();

export {
	singleton as LeetifyMatchUploader,
};
