import { SyncStorageKey } from '../types/enums';
import { MatchSync } from './match-sync';
import { getOptionDefaults } from './constants';

class SyncOnPageVisit {
	protected lastSyncOnPageVisit: Date | null = null;
	protected syncOnVisitGcpdCachePromise: Promise<boolean>;
	protected syncOnVisitLeetifyCachePromise: Promise<boolean>;

	public constructor() {
		this.onTabUpdated = this.onTabUpdated.bind(this);

		const defaults = getOptionDefaults();

		const onVisitsPromise: Promise<{
			[SyncStorageKey.OPTION_SYNC_ON_VISIT_GCPD]?: boolean;
			[SyncStorageKey.OPTION_SYNC_ON_VISIT_LEETIFY]?: boolean;
		}> = chrome.storage.sync.get([
			SyncStorageKey.OPTION_SYNC_ON_VISIT_GCPD,
			SyncStorageKey.OPTION_SYNC_ON_VISIT_LEETIFY,
		]);

		this.syncOnVisitLeetifyCachePromise = onVisitsPromise.then((items) => items[SyncStorageKey.OPTION_SYNC_ON_VISIT_LEETIFY] ?? defaults[SyncStorageKey.OPTION_SYNC_ON_VISIT_LEETIFY]);
		this.syncOnVisitGcpdCachePromise = onVisitsPromise.then((items) => items[SyncStorageKey.OPTION_SYNC_ON_VISIT_GCPD] ?? defaults[SyncStorageKey.OPTION_SYNC_ON_VISIT_GCPD]);
	}

	public async applyListener(): Promise<void> {
		const [
			shouldSyncOnVisitGcpd,
			shouldSyncOnVisitLeetify,
		] = await Promise.all([
			this.syncOnVisitGcpdCachePromise,
			this.syncOnVisitLeetifyCachePromise,
		]);

		// this does not cause duplicate listeners
		if (shouldSyncOnVisitGcpd || shouldSyncOnVisitLeetify) this.enable();
		else this.disable();
	}

	public updateSyncOnVisitLeetifyCache(shouldSync: boolean): void {
		this.syncOnVisitLeetifyCachePromise = Promise.resolve(shouldSync);
	}

	public updateSyncOnVisitGcpdCache(shouldSync: boolean): void {
		this.syncOnVisitGcpdCachePromise = Promise.resolve(shouldSync);
	}

	protected async onTabUpdated(tabId: number, changeInfo: { status?: string }, tab: chrome.tabs.Tab): Promise<void> {
		if (!tab.url) return; // we don't have permissions for this tab
		if (tab.status !== 'complete') return; // the page has not finished loading
		if (changeInfo.status !== 'complete') return; // the event was fired for another reason than the page completing loading

		// run sync max every 5 minutes from page visits
		const fiveMinutesAgo = +new Date() - 5 * 60 * 1000;
		if (this.lastSyncOnPageVisit && +this.lastSyncOnPageVisit >= fiveMinutesAgo) return;

		this.lastSyncOnPageVisit = new Date();

		if (/^https:\/\/leetify\.test($|\/)/.test(tab.url)) {
			if (await this.syncOnVisitLeetifyCachePromise) await MatchSync.run();
		} else if (/^https:\/\/steamcommunity\.com\/(id\/[^/]+|profiles\/\d+)\/gcpd\/730/.test(tab.url)) {
			if (await this.syncOnVisitGcpdCachePromise) await MatchSync.run();
		}
	}

	protected enable(): void {
		chrome.tabs.onUpdated.addListener(this.onTabUpdated);
	}

	protected disable(): void {
		chrome.tabs.onUpdated.removeListener(this.onTabUpdated);
	}
}

const singleton = new SyncOnPageVisit();

export {
	singleton as SyncOnPageVisit,
};
