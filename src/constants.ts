import { SyncStorageKey } from '../types/enums';

// NB! If these need changing, also update manifest.json
export const LEETIFY_API_DOMAIN = 'api.leetify.com';
export const LEETIFY_FRONTEND_DOMAIN = 'leetify.com';
export const LEETIFY_API_URL = `https://${LEETIFY_API_DOMAIN}`;
export const LEETIFY_FRONTEND_URL = `https://${LEETIFY_FRONTEND_DOMAIN}`;

export const getOptionDefaults = () => ({
	[SyncStorageKey.OPTION_SYNC_UNRANKED_WINGMAN]: true,
	[SyncStorageKey.OPTION_SYNC_RANKED_WINGMAN]: true,
	[SyncStorageKey.OPTION_SYNC_UNRANKED_5V5]: true,
	[SyncStorageKey.OPTION_SYNC_ON_INTERVAL]: true,
	[SyncStorageKey.OPTION_SYNC_ON_VISIT_LEETIFY]: true,
	[SyncStorageKey.OPTION_SYNC_ON_VISIT_GCPD]: true,
});
