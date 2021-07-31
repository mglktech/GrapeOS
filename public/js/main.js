const about = document.querySelector("#about");
const login = document.querySelector("#login");
const hlStatus = document.querySelector("#hl-status");
const test = document.querySelector("#test");

const time = document.querySelector("#time");
const date = document.querySelector("#date");

window.document.addEventListener("formHandler", handleForm, false);
async function handleForm(e) {
	console.log("Form data is as follows:");
	for (var pair of e.detail.entries()) {
		console.log(pair);
	}
	let redir = e.detail.get("redir");
	let request = new XMLHttpRequest();
	request.open("POST", redir);
	request.send(e.detail);
}

let optsAbout = {
	title: "About Me",
	width: "400px",
	height: "400px",
	x: "center",
	url: "/about",
	onblur: function () {
		this.setBackground("#00765B");
	},
};
let optsLogin = {
	title: "Login",
	// modal: true,
	width: "400px",
	height: "400px",
	x: "center",
	// top: 50,
	// right: 50,
	// bottom: 50,
	// left: 50,
	html: "",
	// onfocus: function () {
	// 	this.setBackground("#00AD8D");
	// },
	onblur: function () {
		this.setBackground("#00765B");
	},
};

let optsHLStatus = {
	onblur: function () {
		this.setBackground("#00765B");
	},
};

hlStatus.addEventListener("click", () => {
	const box = winBox({
		title: "HighLife Roleplay Server Status",
		width: "800px",
		height: "600px",
		url: "/api/winbox/hlServerStatus",
	});
});
test.addEventListener("click", () => {
	const box = winBox({
		title: "Buttons",
		width: "400px",
		height: "400px",
		url: "/api/winbox/btns",
	});
});

about.addEventListener("click", () => {
	const box = winBox({
		title: "About Me",
		width: "400px",
		height: "400px",
		x: "center",
		url: "/about",
	});
});

login.addEventListener("click", () => {
	const box = winBox({
		title: "Login",
		width: "400px",
		height: "400px",
		x: "right",
		y: "bottom",
		bottom: 50,
		url: "/auth/login",
	});
});

const updateClock = () => {
	let now = new Date();
	let strTime = `${padLeadingZeros(now.getHours())}:${padLeadingZeros(
		now.getMinutes()
	)}`;
	let strDate = `${padLeadingZeros(now.getDate())}/${padLeadingZeros(
		now.getMonth() + 1
	)}/${padLeadingZeros(now.getFullYear())}`;
	time.innerHTML = strTime;
	date.innerHTML = strDate;
};

const initClock = () => {
	updateClock();
	window.setInterval("updateClock()", 1000);
};

date.addEventListener("load", initClock());

const winBox = (opts) => {
	const defaultOpts = {
		onblur: function () {
			this.setBackground("#00765B");
		},
	};
	let allOpts = Object.assign({}, opts, defaultOpts);
	//console.log(allOpts);
	return new WinBox(allOpts);
};

function padLeadingZeros(num, size = 2) {
	// https://www.codegrepper.com/code-examples/javascript/javascript+add+leading+zeros
	var s = num + "";
	while (s.length < size) s = "0" + s;
	return s;
}
