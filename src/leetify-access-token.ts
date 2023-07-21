import { SessionStorageKey } from '../types/enums';

interface LeetifyAccessTokenBody {
	accessToken: string;
}

const isLeetifyAccessTokenBody = (test: any): test is LeetifyAccessTokenBody => typeof test === 'object'
	&& test.hasOwnProperty('accessToken')
	&& typeof test['accessToken'] === 'string';

class LeetifyAccessToken {
	protected fetchLeetifyAccessTokenTabId?: number;

	public async tryToFetchLeetifyAccessToken(): Promise<void> {
		const tab = await chrome.tabs.create({
			url: 'https://leetify.com/?redirect=no',
			active: false,
		});

		if (tab?.id) this.fetchLeetifyAccessTokenTabId = tab.id;
	};

	public async handleEvent(messageBody: Record<string, any>): Promise<void> {
		if (!isLeetifyAccessTokenBody(messageBody)) return;
		if (!messageBody?.accessToken) return;

		if (this.fetchLeetifyAccessTokenTabId) {
			await chrome.tabs.remove(this.fetchLeetifyAccessTokenTabId);
			this.fetchLeetifyAccessTokenTabId = undefined;
		}

		console.log('received leetify access token', messageBody.accessToken);

		await chrome.storage.session.set({
			[SessionStorageKey.LEETIFY_ACCESS_TOKEN]: messageBody.accessToken,
		});
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
