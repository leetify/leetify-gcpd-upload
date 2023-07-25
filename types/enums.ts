/* eslint-disable no-shadow */

export enum AlarmName {
	BACKGROUND_SYNC = 'background_sync',
}

export enum DeclarativeNetRequestRuleId {
	STRIP_FRAME_OPTIONS_HEADERS_FROM_LEETIFY_REQUESTS = 1,
}

export enum EventName {
	LEETIFY_ACCESS_TOKEN = 'leetify_access_token',
	OPTION_UPDATED = 'option_updated',
	REQUEST_MATCH_SYNC = 'request_match_sync',
	REQUEST_PARSE_STEAM_GCPD = 'request_parse_steam_gcpd',
	REQUEST_SYNC_STATUS = 'request_sync_status',
	SYNC_STATUS = 'sync_status',
}

export enum GcpdError {
	INVALID_RESPONSE = 'invalid_response',
	STEAM_AUTH_FAILED = 'steam_auth_failed',
}

export enum GcpdTab {
	SCRIMMAGE = 'matchhistoryscrimmage',
	WINGMAN = 'matchhistorywingman',
}

export enum StatusIcon {
	ALERT_CIRCLE = 'alert-circle',
	CHECK = 'check',
	DOTS_HORIZONTAL = 'dots-horizontal',
	SPINNER = 'spinner',
}

export enum SyncStatus {
	IDLE = 'idle',
	WAITING_FOR_LEETIFY_AUTH = 'waiting_for_leetify_auth',
	LEETIFY_AUTH_FAILED = 'leetify_auth_failed',
	LEETIFY_AUTH_SUCCESSFUL = 'leetify_auth_successful',
	GCPD_PARSER_INITIALIZING = 'gcpd_parser_initializing',
	GCPD_PARSER_INITIALIZED = 'gcpd_parser_initialized',
	BEGINNING_SYNC = 'beginning_sync',
	REQUESTING_GCPD_PAGE = 'requesting_gcpd_page',
	INVALID_GCPD_RESPONSE = 'invalid_gcpd_response',
	STEAM_AUTH_FAILED = 'steam_auth_failed',
	FINISHED_GCPD = 'finished_gcpd',
	UPLOADING_TO_LEETIFY = 'uploading_to_leetify',
	UPLOADING_TO_LEETIFY_FAILED = 'uploading_to_leetify_failed',
	FINISHED_SYNC = 'finished_sync',
	DONE = 'done',
}

export enum SyncStorageKey {
	FOUND_MATCH_TIMESTAMP_SCRIMMAGE = 'found_match_timestamp_scrimmage',
	FOUND_MATCH_TIMESTAMP_WINGMAN = 'found_match_timestamp_wingman',
	OPTION_SYNC_ON_INTERVAL = 'option_sync_on_interval',
	OPTION_SYNC_ON_VISIT_GCPD = 'option_sync_on_visit_gcpd',
	OPTION_SYNC_ON_VISIT_LEETIFY = 'option_sync_on_visit_leetify',
	OPTION_SYNC_RANKED_WINGMAN = 'option_sync_ranked_wingman',
	OPTION_SYNC_UNRANKED_5V5 = 'option_sync_unranked_5v5',
	OPTION_SYNC_UNRANKED_WINGMAN = 'option_sync_unranked_wingman',
}
