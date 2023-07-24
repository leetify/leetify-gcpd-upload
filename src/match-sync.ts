import { defer } from './helpers/defer';
import { EventName, GcpdError, GcpdTab, SyncStatus, SyncStorageKey } from '../types/enums';
import { GcpdMatch, isLeetifyAccessTokenEventBody, isRuntimeMessage, SyncStatusEventBody } from '../types/interfaces';
import { Gcpd } from './gcpd';
import { syncStorageKey } from './helpers/sync-storage-key';
import { getOptionDefaults } from './constants';

class MatchSync {
	protected inProgress = false;
	protected lastStatusEventBody: SyncStatusEventBody = { status: SyncStatus.WAITING_FOR_LEETIFY_AUTH };
	protected leetifyAccessTokenPromise: ReturnType<typeof defer<string | null>> | null = null;

	public constructor() {
		this.setupListeners();
	}

	public async run(): Promise<void> {
		if (this.inProgress) return;
		this.inProgress = true;

		try {
			await this.setStatus({ status: SyncStatus.WAITING_FOR_LEETIFY_AUTH });

			this.leetifyAccessTokenPromise = defer<string | null>();

			chrome.offscreen.createDocument({
				justification: 'Authenticate with Leetify',
				reasons: ['IFRAME_SCRIPTING'],
				url: 'src/offscreen/leetify-auth.html',
			}).catch((err) => {
				// TODO this is not great: Chrome never considers the offscreen page to have finished loading for some reason, so we just have it close itself when it's done -- that throws this error, which we don't care about
				if (err && err.message === 'Offscreen document closed before fully loading.') return;
				throw err;
			});

			const leetifyAccessToken = await this.leetifyAccessTokenPromise;
			this.leetifyAccessTokenPromise = null;
			await chrome.offscreen.closeDocument();

			if (!leetifyAccessToken) return await this.setStatus({ status: SyncStatus.LEETIFY_AUTH_FAILED });

			await this.setStatus({ status: SyncStatus.LEETIFY_AUTH_SUCCESSFUL });
			await this.setStatus({ status: SyncStatus.GCPD_PARSER_INITIALIZING });

			await chrome.offscreen.createDocument({
				justification: 'Parse Steam GCPD page',
				reasons: ['DOM_PARSER'],
				url: 'src/offscreen/dom-parser.html',
			});

			await this.setStatus({ status: SyncStatus.GCPD_PARSER_INITIALIZED });

			const syncSuccessful = await this.syncAllMatches(leetifyAccessToken);
			if (syncSuccessful) await this.setStatus({ status: SyncStatus.DONE });
		} finally {
			this.leetifyAccessTokenPromise = null;
			await chrome.offscreen.closeDocument().catch(() => {});
			this.inProgress = false;
		}
	}

	public async setStatus(eventBody: SyncStatusEventBody): Promise<void> {
		this.lastStatusEventBody = eventBody;

		await this.setActionBadge(eventBody.status);

		// TODO it seems like there's currently no good way to find all tabs "owned" by this extension, so for now, we'll just always try to send a status message
		// if (!await SyncForegroundTab.exists()) return;

		try {
			await chrome.runtime.sendMessage({ event: EventName.SYNC_STATUS, data: eventBody });
		} catch (err) {
			if (err && (err as any).message === 'Could not establish connection. Receiving end does not exist.') return;
			throw err;
		}
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

		if (typeof gcpdResponse === 'string') {
			switch (gcpdResponse) {
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

		const matches = this.filterMatches(gcpdResponse, shouldSync);
		await this.setStatus({ status: SyncStatus.FINISHED_GCPD, found: matches.length });
		if (!matches.length) return true;

		await this.setStatus({ status: SyncStatus.UPLOADING_TO_LEETIFY });

		const response = await fetch('https://api.leetify.test/api/upload-from-url', { // TODO
			method: 'POST',

			body: JSON.stringify({
				matches: matches.map((match) => ({
					url: match.url,
					timestamp: match.timestamp,
				})),
			}),

			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${leetifyAccessToken}`,
			},
		});

		if (response.status !== 204) {
			await this.setStatus({ status: SyncStatus.UPLOADING_TO_LEETIFY_FAILED });
			return false;
		}

		await chrome.storage.sync.set({
			[syncStorageKey(tab)]: matches[0].timestamp,
		});

		await this.setStatus({ tab, status: SyncStatus.FINISHED_SYNC });

		return true;
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

	protected setupListeners(): void {
		chrome.runtime.onMessage.addListener((message, sender): any => {
			console.log('from match sync', message);

			if (sender.id !== chrome.runtime.id) return; // message was not sent from our extension
			if (!isRuntimeMessage(message)) return;

			switch (message.event) {
				case EventName.LEETIFY_ACCESS_TOKEN: return this.handleLeetifyAccessToken(message.data);
				case EventName.REQUEST_SYNC_STATUS: return this.handleRequestSyncStatus();
			}
		});
	}

	protected handleLeetifyAccessToken(data: Record<string, any>): void {
		if (!isLeetifyAccessTokenEventBody(data)) return;

		if (this.leetifyAccessTokenPromise) {
			this.leetifyAccessTokenPromise.resolve(data.accessToken);
		}
	}

	protected async handleRequestSyncStatus(): Promise<void> {
		await chrome.runtime.sendMessage({ event: EventName.SYNC_STATUS, data: this.lastStatusEventBody });
	}

	protected setActionBadge(syncStatus: SyncStatus): Promise<unknown> {
		switch (syncStatus) {
			case SyncStatus.LEETIFY_AUTH_FAILED:
			case SyncStatus.STEAM_AUTH_FAILED:
				return Promise.all([
					chrome.action.setBadgeBackgroundColor({ color: '#de425b' }),
					chrome.action.setBadgeText({ text: 'ERR' }),
					chrome.action.setBadgeTextColor({ color: '#000' }),
				]);

			case SyncStatus.INVALID_GCPD_RESPONSE:
			case SyncStatus.UPLOADING_TO_LEETIFY_FAILED:
				return Promise.all([
					chrome.action.setBadgeBackgroundColor({ color: '#fb9d5a' }),
					chrome.action.setBadgeText({ text: 'fail' }),
					chrome.action.setBadgeTextColor({ color: '#000' }),
				]);

			default:
				return chrome.action.setBadgeText({ text: '' });
		}
	}
}

const singleton = new MatchSync();

export {
	singleton as MatchSync,
};
