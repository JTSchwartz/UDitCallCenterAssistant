let iframeDoc = null;

const DAY = 86400000;
const HOUR = 3600000;
const MIN = 60000;
const SEC = 1000;

class QueueModel {
	constructor(timestampCol = null, statusCol = null) {
		this.timestampCol = timestampCol
		this.statusCol = statusCol
	}
}

// Declare what functions to be run on which tables
let assistantQueues = {
	"CC Queue": new QueueModel(5, 4),
	"CC In Process Queue": new QueueModel(4),
	"Classroom Urgent": new QueueModel(4, 3),
	"CC Maintenance/Project Queue": new QueueModel(4, 6)
};

let lastNotificationSent = new Date() + (10 * MIN);

// TDX Desktops are iframes, this is what needs to be run to grab their inner elements
// Honestly it's just better not to question it
try {
	iframe = document.getElementById("appDesktop");
	iframeWin = iframe.contentWindow || iframe;
	iframeDoc = iframe.contentDocument || iframeWin.document;
} catch {
	iframeDoc = document;
}

// Waits 5 seconds after page load, to run assistant if activated
sleep(5 * SEC).then(() => {
	buildRefreshers();
	iframeDoc.getElementById("btnRefresh").href = "javascript: window.location.reload()";
	
	chrome.storage.sync.get(["enabled", "itsc"], function (data) {
		if (data.enabled) {
			runCCAssistant();
		}
		
		if (data.itsc) {
			runITSCAssistant()
		}
	});
});

// AUTO-REFRESHING
let CCAssistantAutoRefresh = true;
let CCInterval = 6;

chrome.storage.sync.get(["refresh", "interval"], function (data) {
	CCAssistantAutoRefresh = data.refresh;
	CCInterval = data.interval
});

sleep(CCInterval * MIN).then(() => {
	// Use Timeout instead of Interval so that refresh interval can be adjusted
	setTimeout(refresh, CCInterval * MIN);
	
	function refresh() {
		let onDesktop = iframeDoc.getElementById("lblDesktops");
		if (onDesktop) onDesktop = onDesktop.offsetParent;
		
		if (CCAssistantAutoRefresh && onDesktop) {
			window.location.reload();
		}
		
		setTimeout(refresh, CCInterval * MIN);
	}
});

// FUNCTIONS
function buildRefreshers() {
	let queueRefreshers = iframeDoc.getElementsByClassName("refreshAnchor");
	let queueSorters = iframeDoc.getElementsByClassName("sort-link");
	let refreshList = [queueRefreshers, queueSorters];
	
	for (let i = 0; i < refreshList.length; i++) {
		for (let j = 0; j < refreshList[i].length; j++) {
			refreshList[i][j].onclick = function () {
				refresher(3 * SEC);
			};
		}
	}
}

function refresher(time) {
	chrome.storage.sync.get(["enabled", "itsc"], async function (data) {
		await sleep(time);
		
		if (data.enabled) {
			runCCAssistant();
		}
		
		if (data.itsc) {
			runITSCAssistant()
		}
		
		buildRefreshers();
	});
}

function runCCAssistant() {
	let queues = iframeDoc.getElementsByClassName("desktop-module");
	
	// Using a foreach causes issues when destructuring the objects
	console.log(queues)
	for (let i = 0; i < queues.length; i++) {
		let title = queues[i].getElementsByTagName("h4")[0].innerText;
		let table = queues[i].children[1].children[0].children[0];
		if (table) {
			if (Object.keys(assistantQueues).includes(title)) {
				colorQueues(table.children[1], assistantQueues[title])
				// (table.children[1]);
			}
		}
	}
}

function colorQueues(table, model) {
	console.log(table)
	for (let i = 0; i < table.children.length; i++) {
		let row = table.children[i];
		console.log(status)
		let timestampString = row.children[model.timestampCol].innerText;
		let timeDif = unmodifiedSince(timestampString);
		
		if (model.statusCol != null) {
			colorOnStatusAndTime(row, timeDif, model.statusCol)
		} else if (model.timestampCol != null) {
			colorOnTime(row, timeDif)
		} else {
			row.classList.add("CCAssistant_Danger");
		}
	}
}

function colorOnStatusAndTime(row, timeDif, statusCol) {
	let status = row.children[statusCol].innerText;
	if (status === "New") {
		row.classList.add("CCAssistant_New");
		showNewTicketNotification();
	} else if (timeDif > 4 * HOUR) {
		row.classList.add("CCAssistant_Danger");
	} else if (timeDif > 2 * HOUR) {
		row.classList.add("CCAssistant_Warning");
	} else if (status === "On Hold") {
		row.classList.add("CCAssistant_OnHold");
	} else {
		row.classList.add("CCAssistant_Safe");
	}
}

function colorOnTime(row, timeDif) {
	if (timeDif > 4 * HOUR) {
		row.classList.add("CCAssistant_Danger");
	} else if (timeDif > 2 * HOUR) {
		row.classList.add("CCAssistant_Warning");
	} else {
		row.classList.add("CCAssistant_Safe");
	}
}

function disableCCAssistant() {
	let CCAssistant = [".CCAssistant_Danger", ".CCAssistant_Warning", ".CCAssistant_Safe", ".CCAssistant_OnHold", ".CCAssistant_New"];
	
	for (let i = 0; i < CCAssistant.length; i++) {
		let list = document.querySelectorAll(CCAssistant[i]);
		for (let j = 0; j < list.length; j++) {
			list[j].classList.remove(CCAssistant[i].substring(1));
		}
	}
}

function runITSCAssistant() {
	let queues = iframeDoc.getElementsByClassName("desktop-module");
	
	// Using a foreach causes issues when destructuring the objects
	for (let i = 0; i < queues.length; i++) {
		let title = queues[i].getElementsByTagName("h4")[0].innerText;
		let table = queues[i].children[1].children[0].children[0];
		
		if (title === "ITSC Review Queue" && table) {
			table = table.children[1];
			
			for (let j = 0; j < table.children.length; j++) {
				let row = table.children[j];
				let timestampString = row.children[3].innerText;
				let timeDif = unmodifiedSince(timestampString);
				
				if (timeDif > 20 * MIN) {
					row.classList.add("ITSCAssistant_Danger");
					showNewTicketNotification();
				} else if (timeDif > 10 * MIN) {
					row.classList.add("ITSCAssistant_Warning");
					showNewTicketNotification();
				} else {
					row.classList.add("ITSCAssistant_New");
					showNewTicketNotification();
				}
				
			}
		}
	}
}

function disableITSCAssistant() {
	let ITSCAssistant = [".ITSCAssistant_Danger", ".ITSCAssistant_Warning", ".ITSCAssistant_New"];
	
	for (let i = 0; i < ITSCAssistant.length; i++) {
		let list = document.querySelectorAll(ITSCAssistant[i]);
		for (let j = 0; j < list.length; j++) {
			list[j].classList.remove(ITSCAssistant[i].substring(1));
		}
	}
}

let CCAssistantNotifications = true;

chrome.storage.sync.get("notifications", function (data) {
	CCAssistantNotifications = data.notifications
});

function showNewTicketNotification() {
	if ((new Date() - lastNotificationSent) < (10 * MIN) && CCAssistantNotifications) return;
	lastNotificationSent = new Date();
	
	chrome.runtime.sendMessage({greeting: "newTicketNotification"}, function (response) {
	});
}

function unmodifiedSince(timestampString) {
	let timeArray = timestampString.substring(4).split(" ");
	let date = timeArray[0].split("/");
	let time = timeArray[1].split(":");
	
	if (timeArray[2] === "PM" && parseInt(time[0]) < 12) {
		time[0] = (parseInt(time[0]) + 12).toString();
	} else if (timeArray[2] === "AM" && parseInt(time[0]) === 12) {
		time[0] = "0";
	}
	
	let ticketTime = new Date(parseInt(date[2]) + 2000, parseInt(date[0]) - 1, parseInt(date[1]), parseInt(time[0]), parseInt(time[1]), 0, 0);
	let timeNow = new Date(Date.now());
	return timeNow - ticketTime;
}

function sleep(length) {
	return new Promise(resolve => setTimeout(resolve, length));
}
