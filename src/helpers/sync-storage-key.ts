import { GcpdTab, SyncStorageKey } from '../../types/enums';

export const syncStorageKey = (tab: GcpdTab): SyncStorageKey.FOUND_MATCH_TIMESTAMP_SCRIMMAGE | SyncStorageKey.FOUND_MATCH_TIMESTAMP_WINGMAN => {
	switch (tab) {
		case GcpdTab.SCRIMMAGE: return SyncStorageKey.FOUND_MATCH_TIMESTAMP_SCRIMMAGE;
		case GcpdTab.WINGMAN: return SyncStorageKey.FOUND_MATCH_TIMESTAMP_WINGMAN;
	}
};
