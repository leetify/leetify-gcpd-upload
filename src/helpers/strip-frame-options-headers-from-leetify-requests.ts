import { DeclarativeNetRequestRuleId } from '../../types/enums';

// TODO make sure this only applies within the extension
export const stripFrameOptionsHeadersFromLeetifyRequests = async (): Promise<void> => {
	const rule: chrome.declarativeNetRequest.Rule = {
		id: DeclarativeNetRequestRuleId.STRIP_FRAME_OPTIONS_HEADERS_FROM_LEETIFY_REQUESTS,

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
