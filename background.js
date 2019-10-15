chrome.runtime.onInstalled.addListener(function () {
	chrome.storage.sync.set({enabled: true}, function () {
		console.log("UDit Call Center Assistant has been enabled");
	});
	
	chrome.storage.sync.set({itsc: false}, function () {
		console.log("UDit ITSC Assistant has been enabled");
	});
	
	chrome.storage.sync.set({refresh: true}, function () {
		console.log("AutoRefresh is currently enabled");
	});
	
	chrome.declarativeContent.onPageChanged.removeRules(undefined, function () {
		chrome.declarativeContent.onPageChanged.addRules([{
			conditions: [new chrome.declarativeContent.PageStateMatcher({
				pageUrl: {hostEquals: "udayton.teamdynamix.com"}
			})],
			actions: [new chrome.declarativeContent.ShowPageAction()]
		}]);
	});
});

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
	if (request.greeting === "newTicketNotification") {
		let opt = {
			iconUrl: "img/UDLogo128.png",
			type: 'basic',
			title: 'New Tickets',
			message: 'There are new tickets in the queue for you to look at.',
			priority: 1,
		};
		
		chrome.notifications.create('newTicket', opt, function() {});
		
		sendResponse({farewell: new Date()})
	}
});