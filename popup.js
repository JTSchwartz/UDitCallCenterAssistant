let changeAssistantState = document.getElementById("CCAssistantSwitch");
let refreshState = document.getElementById("AutoRefreshSwitch");

chrome.storage.sync.get("enabled", function(data) {
	changeAssistantState.checked = data.enabled;
	changeAssistantState.setAttribute("value", data.enabled);
});

chrome.storage.sync.get("refresh", function(data) {
	refreshState.checked = data.enabled;
	refreshState.setAttribute("value", data.enabled);
});

changeAssistantState.onclick = function () {
	let state = changeAssistantState.checked;
	
	if (state) {
		chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
			chrome.tabs.executeScript(
				tabs[0].id,
				{allFrames: true, frameId: 0, file: "CCAssistant.js"});
		});
	} else {
		chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
			chrome.tabs.executeScript(
				tabs[0].id,
				{allFrames: true, frameId: 0, file: "CCAssistantDisable.js"});
		});
	}
	
	changeAssistantState.checked = state;
	changeAssistantState.setAttribute('value', (state ? "true" : "false"));
	
	chrome.storage.sync.set({enabled: state}, function() {
		console.log("UDit Call Center Assistant has been " + (state ? "enabled" : "disabled"));
	});
};

refreshState.onclick = function () {
	let state = refreshState.checked;
	console.log("State " + state + " RefreshState " + refreshState.checked);
	
	refreshState.checked = state;
	refreshState.setAttribute('value', (state ? "true" : "false"));
	
	chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
		chrome.tabs.executeScript(
			tabs[0].id,
			{allFrames: true, frameId: 0, code: "CCAssistantAutoRefresh = " + (state ? "true" : "false") + ";"});
	});
	
	chrome.storage.sync.set({enabled: state}, function() {
		console.log("AutoRefresh has been " + (state ? "enabled" : "disabled"));
	});
};