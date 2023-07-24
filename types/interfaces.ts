import { EventName, SyncStorageKey } from './enums';

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

export interface GcpdMatch {
	ranked: boolean;
	timestamp: string;
	url: string;
}

export const isGcpdMatch = (v: any): v is GcpdMatch => typeof v === 'object'
	&& v.hasOwnProperty('ranked')
	&& typeof v.ranked === 'boolean'
	&& v.hasOwnProperty('timestamp')
	&& typeof v.timestamp === 'string'
	&& v.hasOwnProperty('url')
	&& typeof v.url === 'string';

export interface ParseSteamGcpdEventResponseBody {
	cells: number;
	matches: GcpdMatch[];
}

export const isParseSteamGcpdEventResponseBody = (v: any): v is ParseSteamGcpdEventResponseBody => typeof v === 'object'
	&& v.hasOwnProperty('cells')
	&& typeof v.cells === 'number'
	&& v.hasOwnProperty('matches')
	&& Array.isArray(v.matches)
	&& v.matches.every((m: any) => isGcpdMatch(m));

export interface ParseSteamGcpdEventBody {
	html: string;
	previouslyFoundMatchTimestamp?: string;
}

export const isParseSteamGcpdEventBody = (v: any): v is ParseSteamGcpdEventBody => typeof v === 'object'
	&& v.hasOwnProperty('html')
	&& typeof v.html === 'string'
	&& (
		!v.hasOwnProperty('previouslyFoundMatchTimestamp')
		|| typeof v.previouslyFoundMatchTimestamp === 'string'
	);

export interface OptionUpdatedEventBody {
	key: SyncStorageKey;
	value: boolean;
}

export const isOptionUpdatedEventBody = (v: any): v is OptionUpdatedEventBody => typeof v === 'object'
	&& v.hasOwnProperty('key')
	&& typeof v.key === 'string'
	&& Object.values(SyncStorageKey).includes(v.key)
	&& v.hasOwnProperty('value')
	&& typeof v.value === 'boolean';
