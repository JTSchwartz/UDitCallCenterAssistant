let iframe = document.getElementById("appDesktop"),
	iframeWin = iframe.contentWindow || iframe,
	iframeDoc = iframe.contentDocument || iframeWin.document;

setInterval(refresh, 600000);

chrome.storage.sync.get("enabled", async function (data) {
	await sleep(5000);
	
	if (data.enabled) {
		runAssistant();
	}
});

function refresh() {
	window.location.reload();
}

function disableAssistant() {
	CCAssistant = [".CCAssistant_Danger", ".CCAssistant_Warning", ".CCAssistant_Safe", ".CCAssistant_OnHold"];
	
	for (let i = 0; i < CCAssistant.length; i++) {
		let list = document.querySelectorAll(CCAssistant[i]);
		for (let j = 0; j < list.length; j++) {
			list[j].classList.remove(CCAssistant[i].substring(1));
		}
	}
}

function runAssistant() {
	let iframe = document.getElementById("appDesktop"),
		iframeWin = iframe.contentWindow || iframe,
		iframeDoc = iframe.contentDocument || iframeWin.document;
	
	div = iframeDoc.getElementById("Column2");
	childDiv = div.getElementsByClassName("ModuleContent")[0];
	table = childDiv.children[0].children[1];
	
	for (let i = 0; i < table.children.length; i++) {
		let row = table.children[i];
		let status = row.children[4].innerText;
		let timestampString = row.children[6].innerText;
		let timeArray = timestampString.substring(4,).split(" ");
		let date = timeArray[0].split("/");
		let time = timeArray[1].split(":");
		
		if (timeArray[2] === "PM") time[0] = (parseInt(time[0]) + 12).toString();
		
		let ticketTime = new Date(parseInt(date[2]) + 2000, parseInt(date[0]) - 1, parseInt(date[1]), parseInt(time[0]), parseInt(time[1]), 0, 0);
		let timeNow = new Date(Date.now());
		let timeDif = timeNow - ticketTime;
		
		row.classList.remove("TDAlternatingRow");
		
		if (status === "New") {
			row.classList.add("CCAssistant_Danger");
		} else if (timeDif > 43200000) {
			row.classList.add("CCAssistant_Warning");
		} else if (status === "On Hold") {
			row.classList.add("CCAssistant_OnHold");
		} else {
			row.classList.add("CCAssistant_Safe");
		}
	}
}

function sleep(ms) {
	return new Promise(resolve => setTimeout(resolve, ms));
}