danger = document.querySelectorAll(".CCAssistant_Danger");
warning = document.querySelectorAll(".CCAssistant_Warning");
safe = document.querySelectorAll(".CCAssistant_Safe");

for (let i = 0; i < safe.length; i++) {
	safe[i].classList.remove("CCAssistant_Safe");
}

for (let i = 0; i < warning.length; i++) {
	warning[i].classList.remove("CCAssistant_Warning");
}

for (let i = 0; i < danger.length; i++) {
	danger[i].classList.remove("CCAssistant_Danger");
}