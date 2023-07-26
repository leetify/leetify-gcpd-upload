// This module handles the Service Worker side of the foreground view.

import { tabExists } from './helpers/tab-exists';

class ViewTab {
	protected static readonly URL = 'src/view/index.html';

	protected tab: chrome.tabs.Tab | null = null;

	public async openOrFocus(): Promise<void> {
		if (await this.exists()) {
			await chrome.tabs.update(this.tab!.id!, { active: true });
			return;
		}

		this.tab = await chrome.tabs.create({
			url: ViewTab.URL,
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

const singleton = new ViewTab();

export {
	singleton as ViewTab,
};
