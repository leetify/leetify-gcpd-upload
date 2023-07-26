import { defer } from './helpers/defer';
import { isLeetifyAccessTokenEventBody } from '../types/interfaces';

class LeetifyAccessToken {
	protected leetifyAccessTokenPromise: ReturnType<typeof defer<string | null>> | null = null;

	public async get(): Promise<string | null> {
		this.leetifyAccessTokenPromise = defer<string | null>();

		await chrome.offscreen.createDocument({
			justification: 'Authenticate with Leetify',
			reasons: ['IFRAME_SCRIPTING'],
			url: 'src/offscreen/leetify-auth.html',
		});

		const leetifyAccessToken = await this.leetifyAccessTokenPromise;
		this.leetifyAccessTokenPromise = null;
		await chrome.offscreen.closeDocument();

		return leetifyAccessToken;
	}

	public handleLeetifyAccessTokenEvent(data: Record<string, any>): void {
		if (!isLeetifyAccessTokenEventBody(data)) return;

		if (this.leetifyAccessTokenPromise) {
			this.leetifyAccessTokenPromise.resolve(data.accessToken);
		}
	}

	public clearPromise(): void {
		this.leetifyAccessTokenPromise = null;
	}
}

const singleton = new LeetifyAccessToken();

export {
	singleton as LeetifyAccessToken,
};
