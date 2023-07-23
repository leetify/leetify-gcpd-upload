import { SessionStorageKey } from '../types/enums';

interface LeetifyAccessTokenBody {
	accessToken: string | null;
}

const isLeetifyAccessTokenBody = (v: any): v is LeetifyAccessTokenBody => typeof v === 'object'
	&& v.hasOwnProperty('accessToken')
	&& (
		typeof v.accessToken === 'string'
		|| v.accessToken === null
	);

class LeetifyAccessToken {
	protected fetchLeetifyAccessTokenTabId?: number;

	public async tryToFetchLeetifyAccessToken(): Promise<void> {
		const tab = await chrome.tabs.create({
			url: 'https://leetify.test/?redirect=no', // TODO
			active: false,
		});

		if (tab?.id) this.fetchLeetifyAccessTokenTabId = tab.id;
	}

	public async handleEvent(messageBody: Record<string, any>): Promise<void> {
		if (!isLeetifyAccessTokenBody(messageBody)) return;

		if (this.fetchLeetifyAccessTokenTabId) {
			await chrome.tabs.remove(this.fetchLeetifyAccessTokenTabId);
			this.fetchLeetifyAccessTokenTabId = undefined;
		}

		if (messageBody.accessToken) {
			await chrome.storage.session.set({
				[SessionStorageKey.LEETIFY_ACCESS_TOKEN]: messageBody.accessToken,
			});
		} else {
			await chrome.storage.session.remove(SessionStorageKey.LEETIFY_ACCESS_TOKEN);
		}
	}

	public async getToken(): Promise<string | undefined> {
		const res = await chrome.storage.session.get(SessionStorageKey.LEETIFY_ACCESS_TOKEN);
		return res?.[SessionStorageKey.LEETIFY_ACCESS_TOKEN];
	}
}

const singleton = new LeetifyAccessToken();

export {
	singleton as LeetifyAccessToken,
};
