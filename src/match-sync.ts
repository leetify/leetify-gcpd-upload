import { defer } from './helpers/defer';
import { EventName, GcpdTab, SyncStatus } from '../types/enums';
import { isLeetifyAccessTokenEventBody, isRuntimeMessage, RuntimeMessage } from '../types/interfaces';
import { SyncForegroundTab } from './sync-foreground-tab';
import { Gcpd } from './gcpd';
import { syncStorageKey } from './helpers/sync-storage-key';

class MatchSync {
	protected leetifyAccessTokenPromise: ReturnType<typeof defer<string | null>> | null = null;
	protected syncInProgress = false;

	public constructor() {
		this.setupListeners();
	}

	protected async sendMessageIfSyncForegroundPageExists(message: RuntimeMessage): Promise<void> {
		if (!await SyncForegroundTab.exists()) return;

		await chrome.runtime.sendMessage(message);
	};

	public async run(): Promise<void> {
		if (this.syncInProgress) return;
		this.syncInProgress = true;

		try {
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

			if (!leetifyAccessToken) return await this.sendMessageIfSyncForegroundPageExists({ event: EventName.SYNC_STATUS, data: { status: SyncStatus.LEETIFY_AUTH_FAILED } });

			await this.sendMessageIfSyncForegroundPageExists({ event: EventName.SYNC_STATUS, data: { status: SyncStatus.LEETIFY_AUTH_SUCCESSFUL } });
			await this.sendMessageIfSyncForegroundPageExists({ event: EventName.SYNC_STATUS, data: { status: SyncStatus.GCPD_PARSER_INITIALIZING } });

			await chrome.offscreen.createDocument({
				justification: 'Parse Steam GCPD page',
				reasons: ['DOM_PARSER'],
				url: 'src/offscreen/dom-parser.html',
			});

			await chrome.runtime.sendMessage({ event: EventName.SYNC_STATUS, data: { status: SyncStatus.GCPD_PARSER_INITIALIZED } });

			await this.syncAllMatches(leetifyAccessToken);

			await chrome.runtime.sendMessage({ event: EventName.SYNC_STATUS, data: { status: SyncStatus.DONE } });
		} finally {
			await chrome.offscreen.closeDocument().catch(() => {});
			this.syncInProgress = false;
		}
	}

	protected async syncAllMatches(leetifyAccessToken: string): Promise<void> {
		await this.syncMatches(GcpdTab.SCRIMMAGE, leetifyAccessToken);
		await this.syncMatches(GcpdTab.WINGMAN, leetifyAccessToken);
	}

	protected async syncMatches(tab: GcpdTab, leetifyAccessToken: string): Promise<void> {
		await chrome.runtime.sendMessage({ event: EventName.SYNC_STATUS, data: { tab, status: SyncStatus.BEGINNING_SYNC } });

		const matches = await Gcpd.fetchAllMatches(tab);
		await chrome.runtime.sendMessage({ event: EventName.SYNC_STATUS, data: { status: SyncStatus.FINISHED_GCPD, found: matches.length } });
		if (!matches.length) return;

		await chrome.runtime.sendMessage({ event: EventName.SYNC_STATUS, data: { status: SyncStatus.UPLOADING_TO_LEETIFY } });

		const response = await fetch('https://api.leetify.test/api/upload-from-url', { // TODO
			method: 'POST',
			body: JSON.stringify({ matches }),

			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${leetifyAccessToken}`,
			},
		});

		if (response.status !== 204) return await chrome.runtime.sendMessage({ event: EventName.SYNC_STATUS, data: { status: SyncStatus.UPLOADING_TO_LEETIFY_FAILED } });

		await chrome.storage.sync.set({
			[syncStorageKey(tab)]: matches[0].timestamp,
		});

		await chrome.runtime.sendMessage({ event: EventName.SYNC_STATUS, data: { tab, status: SyncStatus.FINISHED_SYNC } });
	}

	protected setupListeners(): void {
		chrome.runtime.onMessage.addListener((message, sender, sendResponse): any => {
			console.log('from match sync', message)

			if (sender.id !== chrome.runtime.id) return; // message was not sent from our extension
			if (!isRuntimeMessage(message)) return;

			switch (message.event) {
				case EventName.LEETIFY_ACCESS_TOKEN: return this.handleLeetifyAccessToken(message.data);
			}
		});
	}

	protected handleLeetifyAccessToken(data: Record<string, any>): void {
		if (!isLeetifyAccessTokenEventBody(data)) return;

		if (this.leetifyAccessTokenPromise) {
			this.leetifyAccessTokenPromise.resolve(data.accessToken);
		}
	}
}

const singleton = new MatchSync();

export {
	singleton as MatchSync,
};