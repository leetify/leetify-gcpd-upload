// TODO cleanup
import { EventName } from './enums';

export interface LeetifyAccessTokenEventBody {
	accessToken: string | null;
}

export const isLeetifyAccessTokenEventBody = (v: any): v is LeetifyAccessTokenEventBody => typeof v === 'object'
	&& v.hasOwnProperty('accessToken')
	&& (
		typeof v.accessToken === 'string'
		|| v.accessToken === null
	);

export interface RuntimeMessage {
	event: EventName;
	data: Record<string, any>;
}

export const isRuntimeMessage = (v: any): v is RuntimeMessage => typeof v === 'object'
	&& v.hasOwnProperty('event')
	&& typeof v.event === 'string'
	&& Object.values(EventName).includes(v.event)
	&& v.hasOwnProperty('data')
	&& typeof v === 'object'
	&& !Array.isArray(v);

export type RuntimeMessageListener = (message: any, sender: chrome.runtime.MessageSender, sendResponse: () => void) => boolean | undefined;

export interface GcpdMatch {
	ranked: boolean;
	timestamp: string;
	url: string;
}

export interface ParseSteamGcpdResponseResponse {
	cells: number;
	matches: GcpdMatch[];
}
