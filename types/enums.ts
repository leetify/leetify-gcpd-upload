/* eslint-disable no-shadow */

export enum EventName {
	DOM_PARSER_READY = 'dom_parser_ready',
	LEETIFY_ACCESS_TOKEN = 'leetify_access_token',
	PARSE_STEAM_GCPD_RESPONSE = 'PARSE_STEAM_GCPD_RESPONSE',
}

export enum GcpdTab {
	SCRIMMAGE = 'matchhistoryscrimmage',
	WINGMAN = 'matchhistorywingman',
}

export enum SessionStorageKey {
	LEETIFY_ACCESS_TOKEN = 'leetify_access_token',
}

export enum SyncStorageKey {
	FOUND_MATCH_TIMESTAMP_SCRIMMAGE = 'found_match_timestamp_scrimmage',
	FOUND_MATCH_TIMESTAMP_WINGMAN = 'found_match_timestamp_wingman',
}
