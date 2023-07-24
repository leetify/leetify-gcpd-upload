export const tabExists = async (tabId: number): Promise<boolean> => {
	try {
		await chrome.tabs.get(tabId);
		return true;
	} catch (err) {
		if (err && (err as any).message === `No tab with id: ${tabId}.`) return false;
		throw err;
	}
};
