import { EventName, SyncStorageKey } from '../../types/enums';
import { getOptionDefaults } from '../constants';

interface Option {
	key: SyncStorageKey;
	label: string;
}

const options: Option[] = [
	{
		key: SyncStorageKey.OPTION_SYNC_UNRANKED_WINGMAN,
		label: 'Sync unranked Wingman matches',
	},

	{
		key: SyncStorageKey.OPTION_SYNC_RANKED_WINGMAN,
		label: 'Sync ranked Wingman matches',
	},

	{
		key: SyncStorageKey.OPTION_SYNC_UNRANKED_5V5,
		label: 'Sync unranked 5v5 matches',
	},

	{
		key: SyncStorageKey.OPTION_SYNC_ON_INTERVAL,
		label: 'Sync matches every 15 minutes (when your browser is open)',
	},

	{
		key: SyncStorageKey.OPTION_SYNC_ON_VISIT_LEETIFY,
		label: 'Sync matches when visiting Leetify',
	},

	{
		key: SyncStorageKey.OPTION_SYNC_ON_VISIT_GCPD,
		label: 'Sync matches when visiting Steam GCPD',
	},
];

(async () => {
	const checkboxContainer = document.querySelector('div#checkbox-container') as HTMLDivElement;

	const values = Object.assign(
		getOptionDefaults(),
		await chrome.storage.sync.get(options.map(({ key }) => key)),
	);

	for (const option of options) {
		const checkbox = document.createElement('input');
		checkbox.type = 'checkbox';
		checkbox.checked = !!values[option.key];

		checkbox.addEventListener('change', async () => {
			await chrome.storage.sync.set({ [option.key]: checkbox.checked });

			await chrome.runtime.sendMessage({
				event: EventName.OPTION_UPDATED,
				data: { key: option.key, value: checkbox.checked },
			});
		});

		const label = document.createElement('label');
		label.appendChild(checkbox);
		label.insertAdjacentText('beforeend', option.label);

		checkboxContainer.appendChild(label);
	}
})();
