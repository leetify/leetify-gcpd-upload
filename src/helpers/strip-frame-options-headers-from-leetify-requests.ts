// TODO make sure this only applies within the extension
export const stripFrameOptionsHeadersFromLeetifyRequests = async (): Promise<void> => {
	const rule: chrome.declarativeNetRequest.Rule = {
		id: 1,

		condition: {
			initiatorDomains: [chrome.runtime.id],
			requestDomains: ['leetify.test'],
			resourceTypes: ['sub_frame'],
		},

		action: {
			type: 'modifyHeaders',

			responseHeaders: [
				{ header: 'X-Frame-Options', operation: 'remove' },
				{ header: 'Frame-Options', operation: 'remove' },
			],
		},
	};

	await chrome.declarativeNetRequest.updateDynamicRules({
		removeRuleIds: [rule.id],
		addRules: [rule],
	});
};
