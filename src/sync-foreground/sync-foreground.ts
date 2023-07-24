chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
	if (sender.id !== chrome.runtime.id) return;

	console.log('from sync foreground', message);

	return false;
});
