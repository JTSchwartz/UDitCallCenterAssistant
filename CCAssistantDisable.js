CCAssistant = [".CCAssistant_Danger", ".CCAssistant_Warning", ".CCAssistant_Safe", ".CCAssistant_OnHold"];

for (let i = 0; i < CCAssistant.length; i++) {
	let list = document.querySelectorAll(CCAssistant[i]);
	for (let j = 0; j < list.length; j++) {
		list[j].classList.remove(CCAssistant[i].substring(1));
	}
}
