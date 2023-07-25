import { DeclarativeNetRequestRuleId } from '../../types/enums';
import { LEETIFY_FRONTEND_DOMAIN } from '../constants';

export const stripFrameOptionsHeadersFromLeetifyRequests = async (): Promise<void> => {
	const rule: chrome.declarativeNetRequest.Rule = {
		id: DeclarativeNetRequestRuleId.STRIP_FRAME_OPTIONS_HEADERS_FROM_LEETIFY_REQUESTS,

		condition: {
			initiatorDomains: [chrome.runtime.id],
			requestDomains: [LEETIFY_FRONTEND_DOMAIN],
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
