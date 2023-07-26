// This module interfaces with GCPD. It recursively requests the GCPD pages (in
// normal use, they are asynchronously loaded when the user clicks a "Load more"
// button), and sending their content to the DOM parser, which extracts the
// match metadata from them.

import { EventName, GcpdError, GcpdTab, SyncStatus } from '../types/enums';
import { GcpdMatch, isParseSteamGcpdEventResponseBody, isSteamGcpdResponse } from '../types/interfaces';
import { LeetifyMatchUploader } from './leetify-match-uploader';
import { MatchSync } from './match-sync';

class Gcpd {
	public async fetchAllMatches(tab: GcpdTab): Promise<GcpdMatch[] | GcpdError> {
		const previouslyFoundMatchTimestamp = await LeetifyMatchUploader.getPreviouslyFoundMatchTimestamp(tab);

		return this.fetchMatchesRecursively({ tab, previouslyFoundMatchTimestamp, matches: [] });
	}

	protected async fetchMatchesRecursively({
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
	}): Promise<GcpdMatch[] | GcpdError> {
		depth = depth === undefined ? 1 : depth;

		await MatchSync.setStatus({ depth, status: SyncStatus.REQUESTING_GCPD_PAGE });

		const url = new URL('https://steamcommunity.com/my/gcpd/730');
		url.searchParams.set('ajax', '1');
		url.searchParams.set('tab', tab);
		if (continueToken) url.searchParams.set('continue_token', continueToken);

		const res = await fetch(url);
		if (!/^https:\/\/steamcommunity\.com\/(id\/[^/]+|profiles\/\d+)\/gcpd\/730/.test(res.url)) return GcpdError.STEAM_AUTH_FAILED;

		const json = await res.json();
		if (!isSteamGcpdResponse(json)) return GcpdError.INVALID_RESPONSE;

		const parsed = await chrome.runtime.sendMessage({
			event: EventName.REQUEST_PARSE_STEAM_GCPD,
			data: { html: json.html, previouslyFoundMatchTimestamp },
		});
		if (!isParseSteamGcpdEventResponseBody(parsed)) return GcpdError.INVALID_RESPONSE;

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
