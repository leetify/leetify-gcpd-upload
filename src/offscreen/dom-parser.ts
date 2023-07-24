import { EventName } from '../../types/enums';
import { isParseSteamGcpdEventBody, isRuntimeMessage, GcpdMatch, ParseSteamGcpdEventResponseBody } from '../../types/interfaces';

const parseSteamGcpd = (message: Record<string, any>, sendResponse: (r: ParseSteamGcpdEventResponseBody) => void) => {
	if (!isParseSteamGcpdEventBody(message)) return;

	const dom = new DOMParser().parseFromString(message.html, 'text/html');
	const cells = dom.querySelectorAll('td.val_left');

	if (!cells.length) return sendResponse({ cells: 0, matches: [] });

	const matches: GcpdMatch[] = [];
	const timestampLimit = message.previouslyFoundMatchTimestamp ? new Date(message.previouslyFoundMatchTimestamp) : undefined;

	for (const cell of cells as unknown as Element[]) {
		const urlElement = cell.querySelector('table.csgo_scoreboard_inner_left tbody tr td a') as HTMLAnchorElement | null;
		if (!urlElement) break; // when a match does not have a download url, all later matches will most likely not have one either

		const url = urlElement.getAttribute('href');
		if (!url || !url.match(/^https?:\/\/replay\d+\.valve\.net\/730\/\d+_\d+\.dem\.bz2$/)) break; // something is weird if this happens

		const timestampElement = cell.querySelector('table.csgo_scoreboard_inner_left tbody tr:nth-child(2) td') as HTMLTableCellElement | null;
		const timestamp = timestampElement?.innerText?.trim();
		if (!timestamp || !timestamp.match(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2} GMT$/)) break; // something is weird if this happens

		// if this match is older or as old as the latest match we've found previously, we don't need to upload it (or any following matches)
		if (timestampLimit && new Date(timestamp) <= timestampLimit) break;

		const rankedElement = cell.querySelector('table.csgo_scoreboard_inner_left tbody tr:nth-child(3) td') as HTMLTableCellElement | null;
		const ranked = !!(rankedElement && rankedElement.innerText.trim() === 'Ranked: Yes');

		matches.push({ ranked, timestamp, url });
	}

	return sendResponse({ cells: cells.length, matches });
};

chrome.runtime.onMessage.addListener((message, sender, sendResponse): any => {
	if (sender.id !== chrome.runtime.id) return; // message was not sent from our extension
	if (!isRuntimeMessage(message)) return;

	switch (message.event) {
		case EventName.REQUEST_PARSE_STEAM_GCPD: return parseSteamGcpd(message.data, sendResponse);
	}
});
