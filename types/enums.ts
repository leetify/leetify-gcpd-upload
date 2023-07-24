/* eslint-disable no-shadow */
// TODO cleanup

export enum AlarmName {
	BACKGROUND_SYNC = 'background_sync',
}

export enum EventName {
	DOM_PARSER_READY = 'dom_parser_ready',
	LEETIFY_ACCESS_TOKEN = 'leetify_access_token',
	LEETIFY_ACCESS_TOKEN_REQUEST = 'leetify_access_token_request',
	PARSE_STEAM_GCPD_RESPONSE = 'parse_steam_gcpd_response',
	SYNC_STATUS = 'sync_status',
}

export enum SyncStatus {
	WAITING_FOR_LEETIFY_AUTH = 'waiting_for_leetify_auth',
	LEETIFY_AUTH_EVENT_RECEIVED = 'leetify_auth_event_received',
	LEETIFY_AUTH_FAILED = 'leetify_auth_failed',
	LEETIFY_AUTH_SUCCESSFUL = 'leetify_auth_successful',
	GCPD_PARSER_INITIALIZING = 'gcpd_parser_initializing',
	GCPD_PARSER_INITIALIZED = 'gcpd_parser_initialized',
	BEGINNING_SYNC = 'beginning_sync',
	REQUESTING_GCPD_PAGE = 'requesting_gcpd_page',
	FINISHED_GCPD = 'finished_gcpd',
	UPLOADING_TO_LEETIFY = 'uploading_to_leetify',
	UPLOADING_TO_LEETIFY_FAILED = 'uploading_to_leetify_failed',
	FINISHED_SYNC = 'finished_sync',
	DONE = 'done',
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
