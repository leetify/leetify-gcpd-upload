// This module is loaded as part of "the view". It instantiates the option
// checkboxes, and handles any changes by sending them to the Service Worker
// (which will then save the changes).

import { EventName, SyncStorageKey } from '../../types/enums';
import { getOptionDefaults } from '../constants';

interface Option {
	key: SyncStorageKey;
	label: string;
}

export class Options {
	protected static readonly OPTIONS: Option[] = [
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

	protected readonly checkboxContainer = document.querySelector('div#checkbox-container') as HTMLDivElement | null;

	public constructor() {
		this.initCheckboxes();
	}

	protected async initCheckboxes(): Promise<void> {
		if (!this.checkboxContainer) return;

		const values = await this.getValues();

		for (const option of Options.OPTIONS) {
			const checkbox = document.createElement('input');
			checkbox.id = `option-${option.key}`;
			checkbox.type = 'checkbox';
			checkbox.checked = !!values[option.key];

			// eslint-disable-next-line @typescript-eslint/no-loop-func
			checkbox.addEventListener('change', async () => {
				await chrome.storage.sync.set({ [option.key]: checkbox.checked });

				await chrome.runtime.sendMessage({
					event: EventName.OPTION_UPDATED,
					data: { key: option.key, value: checkbox.checked },
				});
			});

			const label = document.createElement('label');
			label.innerText = option.label;
			label.setAttribute('for', checkbox.id);

			this.checkboxContainer.appendChild(checkbox);
			this.checkboxContainer.appendChild(label);
		}
	}

	protected async getValues(): Promise<{ [key in SyncStorageKey]?: boolean }> {
		return {
			...getOptionDefaults(),
			...await chrome.storage.sync.get(Options.OPTIONS.map(({ key }) => key)),
		};
	}
}
