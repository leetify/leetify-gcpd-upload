import { SyncStorageKey } from '../types/enums';

export const getOptionDefaults = () => ({
	[SyncStorageKey.OPTION_SYNC_UNRANKED_WINGMAN]: true,
	[SyncStorageKey.OPTION_SYNC_RANKED_WINGMAN]: true,
	[SyncStorageKey.OPTION_SYNC_UNRANKED_5V5]: true,
	[SyncStorageKey.OPTION_SYNC_ON_INTERVAL]: true,
	[SyncStorageKey.OPTION_SYNC_ON_VISIT_LEETIFY]: true,
	[SyncStorageKey.OPTION_SYNC_ON_VISIT_GCPD]: true,
});
