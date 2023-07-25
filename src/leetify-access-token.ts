import { defer } from './helpers/defer';
import { isLeetifyAccessTokenEventBody } from '../types/interfaces';

class LeetifyAccessToken {
	protected leetifyAccessTokenPromise: ReturnType<typeof defer<string | null>> | null = null;

	public async get(): Promise<string | null> {
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
