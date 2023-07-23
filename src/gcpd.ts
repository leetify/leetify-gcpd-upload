import { GcpdMatch, ParseSteamGcpdResponseResponse } from '../types/interfaces';
import { EventName, GcpdTab } from '../types/enums';
import { syncStorageKey } from './helpers/sync-storage-key';

interface SteamGcpdResponse {
	continue_text: string;
	continue_token: string;
	html: string;
	success: true;
}

const isSteamGcpdResponse = (v: any): v is SteamGcpdResponse => typeof v === 'object'
	&& v.hasOwnProperty('continue_text')
	&& typeof v.continue_text === 'string'
	&& v.hasOwnProperty('continue_token')
	&& typeof v.continue_token === 'string'
	&& v.hasOwnProperty('html')
	&& typeof v.html === 'string'
	&& v.hasOwnProperty('success')
	&& typeof v.success === 'boolean'
	&& v.success === true;

class Gcpd {
	public async fetchAllMatches(tab: GcpdTab): Promise<GcpdMatch[]> {
		// Chrome only allows one offscreen document at a time -- so if we try to run this twice at once, it'll throw an error right here and prevent that
		await chrome.offscreen.createDocument({
			justification: 'Parse Steam API response',
			reasons: ['DOM_PARSER'],
			url: 'src/dom-parser.html',
		});

		const previouslyFoundMatchTimestampKey = syncStorageKey(tab);
		const { [previouslyFoundMatchTimestampKey]: previouslyFoundMatchTimestamp } = await chrome.storage.sync.get(previouslyFoundMatchTimestampKey);

		try {
			const matches = await this.fetchMatchesRecursively({ tab, previouslyFoundMatchTimestamp, matches: [] });
			return matches;
		} finally {
			await chrome.offscreen.closeDocument();
		}
	}

	private async fetchMatchesRecursively({
		continueToken,
		depth,
		matches,
		previouslyFoundMatchTimestamp,
		tab,
	}: {
		continueToken?: string;
		depth?: number;
		matches: GcpdMatch[];
		previouslyFoundMatchTimestamp: string | undefined;
		tab: GcpdTab;
	}): Promise<GcpdMatch[]> {
		depth = depth === undefined ? 1 : depth;

		const url = new URL('https://steamcommunity.com/my/gcpd/730');
		url.searchParams.set('ajax', '1');
		url.searchParams.set('tab', tab);
		if (continueToken) url.searchParams.set('continue_token', continueToken);

		const res = await fetch(url);
		const json = await res.json();

		if (!isSteamGcpdResponse(json)) return matches;

		const parsed: ParseSteamGcpdResponseResponse = await chrome.runtime.sendMessage({
			event: EventName.PARSE_STEAM_GCPD_RESPONSE,
			data: { html: json.html, previouslyFoundMatchTimestamp },
		});

		matches.push(...parsed.matches);

		const shouldEndRecursion = depth >= 16 // prevent this from going on too long
			|| !json.continue_token // Steam won't let us request any more
			|| parsed.cells > parsed.matches.length // either found no matches, or there were cells we couldn't parse
			|| (json.continue_text.match(/^\d{4}-\d{2}-\d{2}$/) && +new Date(json.continue_text) < +new Date() - 30 * 24 * 60 * 60 * 1000); // we've looked back far enough, Valve doesn't keep demos for more than 30 days

		if (shouldEndRecursion) return matches;

		return this.fetchMatchesRecursively({
			matches,
			previouslyFoundMatchTimestamp,
			tab,
			continueToken: json.continue_token,
			depth: depth + 1,
		});
	}
}

const singleton = new Gcpd();

export {
	singleton as Gcpd,
};
