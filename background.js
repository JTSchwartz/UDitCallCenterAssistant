chrome.runtime.onInstalled.addListener(function() {
	chrome.storage.sync.set({enabled: false}, function() {
		console.log('UDit Call Center Assistant has been enabled');
	});
	chrome.storage.sync.set({modifiedSince: 43200000}, function() {
		console.log('Modified Since Warning set to: 12 Hours');
	});
	chrome.storage.sync.set({refresh: false}, function() {
		console.log('AutoRefresh has been enabled');
	});
	chrome.declarativeContent.onPageChanged.removeRules(undefined, function() {
		chrome.declarativeContent.onPageChanged.addRules([{
			conditions: [new chrome.declarativeContent.PageStateMatcher({
				pageUrl: {hostEquals: 'udayton.teamdynamix.com'},
			})
			],
			actions: [new chrome.declarativeContent.ShowPageAction()]
		}]);
	});
});

// 3600000ms / hour