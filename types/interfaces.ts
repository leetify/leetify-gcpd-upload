import { EventName, GcpdTab, SyncStatus, SyncStorageKey } from './enums';

export interface GcpdMatch {
	ranked: boolean;
	timestamp: string;
	url: string;
}

export interface LeetifyAccessTokenEventBody {
	accessToken: string | null;
}

export interface OptionUpdatedEventBody {
	key: SyncStorageKey;
	value: boolean;
}

export interface ParseSteamGcpdEventBody {
	html: string;
	previouslyFoundMatchTimestamp?: string;
}

export interface ParseSteamGcpdEventResponseBody {
	cells: number;
	matches: GcpdMatch[];
}

export interface RuntimeMessage {
	data: Record<string, any>;
	event: EventName;
}

export interface SteamGcpdResponse {
	continue_text: string;
	continue_token: string;
	html: string;
	success: true;
}

export type SyncStatusEventBody = {
	status: SyncStatus.DONE | SyncStatus.GCPD_PARSER_INITIALIZED | SyncStatus.GCPD_PARSER_INITIALIZING | SyncStatus.IDLE | SyncStatus.INVALID_GCPD_RESPONSE | SyncStatus.LEETIFY_AUTH_FAILED | SyncStatus.LEETIFY_AUTH_SUCCESSFUL | SyncStatus.STEAM_AUTH_FAILED | SyncStatus.UPLOADING_TO_LEETIFY | SyncStatus.UPLOADING_TO_LEETIFY_FAILED | SyncStatus.WAITING_FOR_LEETIFY_AUTH
} | {
	depth: number;
	status: SyncStatus.REQUESTING_GCPD_PAGE;
} | {
	status: SyncStatus.BEGINNING_SYNC;
	tab: GcpdTab;
} | {
	found: number;
	status: SyncStatus.FINISHED_GCPD;
} | {
	status: SyncStatus.FINISHED_SYNC;
	tab: GcpdTab;
};

export const isGcpdMatch = (v: any): v is GcpdMatch => typeof v === 'object'
	&& v.hasOwnProperty('ranked')
	&& typeof v.ranked === 'boolean'
	&& v.hasOwnProperty('timestamp')
	&& typeof v.timestamp === 'string'
	&& v.hasOwnProperty('url')
	&& typeof v.url === 'string';

export const isLeetifyAccessTokenEventBody = (v: any): v is LeetifyAccessTokenEventBody => typeof v === 'object'
	&& v.hasOwnProperty('accessToken')
	&& (typeof v.accessToken === 'string' || v.accessToken === null);

export const isOptionUpdatedEventBody = (v: any): v is OptionUpdatedEventBody => typeof v === 'object'
	&& v.hasOwnProperty('key')
	&& typeof v.key === 'string'
	&& Object.values(SyncStorageKey).includes(v.key)
	&& v.hasOwnProperty('value')
	&& typeof v.value === 'boolean';

export const isParseSteamGcpdEventBody = (v: any): v is ParseSteamGcpdEventBody => typeof v === 'object'
	&& v.hasOwnProperty('html')
	&& typeof v.html === 'string'
	&& (
		!v.hasOwnProperty('previouslyFoundMatchTimestamp')
		|| typeof v.previouslyFoundMatchTimestamp === 'string'
	);

export const isParseSteamGcpdEventResponseBody = (v: any): v is ParseSteamGcpdEventResponseBody => typeof v === 'object'
	&& v.hasOwnProperty('cells')
	&& typeof v.cells === 'number'
	&& v.hasOwnProperty('matches')
	&& Array.isArray(v.matches)
	&& v.matches.every((m: any) => isGcpdMatch(m));

export const isRuntimeMessage = (v: any): v is RuntimeMessage => typeof v === 'object'
	&& v.hasOwnProperty('event')
	&& typeof v.event === 'string'
	&& Object.values(EventName).includes(v.event)
	&& (
		[
			EventName.REQUEST_MATCH_SYNC,
			EventName.REQUEST_SYNC_STATUS,
		].includes(v.event)
		|| (
			v.hasOwnProperty('data')
			&& typeof v === 'object'
			&& !Array.isArray(v)
		)
	);

export const isSteamGcpdResponse = (v: any): v is SteamGcpdResponse => typeof v === 'object'
	&& v.hasOwnProperty('continue_text')
	&& typeof v.continue_text === 'string'
	&& v.hasOwnProperty('continue_token')
	&& typeof v.continue_token === 'string'
	&& v.hasOwnProperty('html')
	&& typeof v.html === 'string'
	&& v.hasOwnProperty('success')
	&& typeof v.success === 'boolean'
	&& v.success === true;

export const isSyncStatusEventBody = (v: any): v is SyncStatusEventBody => typeof v === 'object'
	&& v.hasOwnProperty('status')
	&& (
		[SyncStatus.DONE, SyncStatus.GCPD_PARSER_INITIALIZED, SyncStatus.GCPD_PARSER_INITIALIZING, SyncStatus.IDLE, SyncStatus.INVALID_GCPD_RESPONSE, SyncStatus.LEETIFY_AUTH_FAILED, SyncStatus.LEETIFY_AUTH_SUCCESSFUL, SyncStatus.STEAM_AUTH_FAILED, SyncStatus.UPLOADING_TO_LEETIFY, SyncStatus.UPLOADING_TO_LEETIFY_FAILED, SyncStatus.WAITING_FOR_LEETIFY_AUTH].includes(v.status)
		|| (v.status === SyncStatus.REQUESTING_GCPD_PAGE && v.hasOwnProperty('depth') && typeof v.depth === 'number')
		|| (v.status === SyncStatus.BEGINNING_SYNC && v.hasOwnProperty('tab') && Object.values(GcpdTab).includes(v.tab))
		|| (v.status === SyncStatus.FINISHED_GCPD && v.hasOwnProperty('found') && typeof v.found === 'number')
		|| (v.status === SyncStatus.FINISHED_SYNC && v.hasOwnProperty('tab') && Object.values(GcpdTab).includes(v.tab))
	);
