let changeAssistantState = document.getElementById("CCAssistantSwitch");

chrome.storage.sync.get("enabled", function(data) {
	changeAssistantState.checked = data.enabled;
	changeAssistantState.setAttribute("value", data.enabled);
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