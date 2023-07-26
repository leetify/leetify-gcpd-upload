// This module is the main code for running a sync. It asks for the Leetify
// access token, initializes the DOM parser, then asks for matches from GCPD,
// and finally sends the found matches to Leetify.
// It's also responsible for sending the current status to the foreground view,
// if it's active.

import { Action } from './action';
import { EventName, GcpdError, GcpdTab, SyncStatus, SyncStorageKey } from '../types/enums';
import { Gcpd } from './gcpd';
import { GcpdMatch, SyncStatusEventBody } from '../types/interfaces';
import { getOptionDefaults } from './constants';
import { LeetifyAccessToken } from './leetify-access-token';
import { LeetifyMatchUploader } from './leetify-match-uploader';

class MatchSync {
	protected inProgress = false;
	protected lastStatusEventBody: SyncStatusEventBody = { status: SyncStatus.IDLE };

	public async run(): Promise<void> {
		if (this.inProgress) return;
		this.inProgress = true;

		try {
			await this.setStatus({ status: SyncStatus.WAITING_FOR_LEETIFY_AUTH });

			const leetifyAccessToken = await LeetifyAccessToken.get();
			if (!leetifyAccessToken) return await this.setStatus({ status: SyncStatus.LEETIFY_AUTH_FAILED });

			await this.setStatus({ status: SyncStatus.LEETIFY_AUTH_SUCCESSFUL });
			await this.initDomParser();

			const syncSuccessful = await this.syncAllMatches(leetifyAccessToken);
			if (syncSuccessful) await this.setStatus({ status: SyncStatus.DONE });
		} finally {
			LeetifyAccessToken.clearPromise();
			await chrome.offscreen.closeDocument().catch(() => {});
			this.inProgress = false;
		}
	}

	public async setStatus(eventBody: SyncStatusEventBody): Promise<void> {
		if (eventBody.status === SyncStatus.DONE) {
			this.lastStatusEventBody = { status: SyncStatus.IDLE };
		} else {
			this.lastStatusEventBody = eventBody;
		}

		await Action.setBadgeFromSyncStatus(eventBody.status);

		// TODO it seems like there's currently no good way to find all tabs "owned" by this extension, so for now, we'll just always try to send a status message
		// if (!await ViewTab.exists()) return;

		try {
			await chrome.runtime.sendMessage({ event: EventName.SYNC_STATUS, data: eventBody });
		} catch (err) {
			if (err && (err as any).message === 'Could not establish connection. Receiving end does not exist.') return;
			throw err;
		}
	}

	public handleRequestMatchSyncEvent(): Promise<void> {
		return this.run();
	}

	public async handleRequestSyncStatusEvent(): Promise<void> {
		await chrome.runtime.sendMessage({ event: EventName.SYNC_STATUS, data: this.lastStatusEventBody });
	}

	protected async initDomParser(): Promise<void> {
		await this.setStatus({ status: SyncStatus.GCPD_PARSER_INITIALIZING });

		await chrome.offscreen.createDocument({
			justification: 'Parse Steam GCPD page',
			reasons: ['DOM_PARSER'],
			url: 'src/offscreen/dom-parser.html',
		});

		await this.setStatus({ status: SyncStatus.GCPD_PARSER_INITIALIZED });
	}

	protected async syncAllMatches(leetifyAccessToken: string): Promise<boolean> {
		const scrimmageSuccessful = await this.syncMatches(GcpdTab.SCRIMMAGE, leetifyAccessToken);
		if (!scrimmageSuccessful) return false;

		const wingmanSuccessful = await this.syncMatches(GcpdTab.WINGMAN, leetifyAccessToken);
		if (!wingmanSuccessful) return false;

		return true;
	}

	protected async syncMatches(tab: GcpdTab, leetifyAccessToken: string): Promise<boolean> {
		const shouldSync = await this.shouldSync(tab);
		if (!shouldSync) return true;

		await this.setStatus({ tab, status: SyncStatus.BEGINNING_SYNC });

		const gcpdResponse = await Gcpd.fetchAllMatches(tab);
		if (typeof gcpdResponse === 'string') return this.handleGcpdError(gcpdResponse);

		const matches = this.filterMatches(gcpdResponse, shouldSync);
		await this.setStatus({ status: SyncStatus.FINISHED_GCPD, found: matches.length });
		if (!matches.length) return true;

		return LeetifyMatchUploader.uploadMatches(matches, tab, leetifyAccessToken);
	}

	protected filterMatches(matches: GcpdMatch[], shouldSync: boolean | 'ranked_only' | 'unranked_only'): GcpdMatch[] {
		switch (shouldSync) {
			case 'ranked_only': return matches.filter(({ ranked }) => ranked);
			case 'unranked_only': return matches.filter(({ ranked }) => !ranked);
			default: return matches;
		}
	}

	protected async shouldSync(tab: GcpdTab): Promise<boolean | 'ranked_only' | 'unranked_only'> {
		const defaults = getOptionDefaults();

		switch (tab) {
			case GcpdTab.SCRIMMAGE: {
				const { [SyncStorageKey.OPTION_SYNC_UNRANKED_5V5]: shouldSync } = await chrome.storage.sync.get(SyncStorageKey.OPTION_SYNC_UNRANKED_5V5);
				return shouldSync ?? defaults[SyncStorageKey.OPTION_SYNC_UNRANKED_5V5];
			}

			case GcpdTab.WINGMAN: {
				const { ranked, unranked } = await chrome.storage.sync.get([
					SyncStorageKey.OPTION_SYNC_RANKED_WINGMAN,
					SyncStorageKey.OPTION_SYNC_UNRANKED_WINGMAN,
				]).then((items) => ({
					ranked: items[SyncStorageKey.OPTION_SYNC_RANKED_WINGMAN] ?? defaults[SyncStorageKey.OPTION_SYNC_RANKED_WINGMAN],
					unranked: items[SyncStorageKey.OPTION_SYNC_UNRANKED_WINGMAN] ?? defaults[SyncStorageKey.OPTION_SYNC_UNRANKED_WINGMAN],
				}));

				if (ranked && unranked) return true;
				if (ranked) return 'ranked_only';
				if (unranked) return 'unranked_only';
				return false;
			}
		}
	}

	protected async handleGcpdError(gcpdError: GcpdError): Promise<false> {
		switch (gcpdError) {
			case GcpdError.INVALID_RESPONSE: {
				await this.setStatus({ status: SyncStatus.INVALID_GCPD_RESPONSE });
				break;
			}

			case GcpdError.STEAM_AUTH_FAILED: {
				await this.setStatus({ status: SyncStatus.STEAM_AUTH_FAILED });
				break;
			}
		}

		return false;
	}
}

const singleton = new MatchSync();

export {
	singleton as MatchSync,
};
