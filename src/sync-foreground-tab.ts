import { tabExists } from './helpers/tab-exists';

class SyncForegroundTab {
	protected static readonly URL = 'src/sync-foreground/sync-foreground.html'

	protected tab: chrome.tabs.Tab | null = null;

	public async openOrFocus(): Promise<void> {
		if (await this.exists()) {
			await chrome.tabs.update(this.tab!.id!, { active: true });
			return;
		}

		this.tab = await chrome.tabs.create({
			url: SyncForegroundTab.URL,
			active: true,
		});
	}

	public async exists(): Promise<boolean> {
		if (!this.tab?.id) return false;

		if (!await tabExists(this.tab.id)) {
			this.tab = null;
			return false;
		}

		return true;
	}
}

const singleton = new SyncForegroundTab();

export {
	singleton as SyncForegroundTab,
};
