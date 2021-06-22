const about = document.querySelector("#about");
const login = document.querySelector("#login");

const time = document.querySelector("#time");
const date = document.querySelector("#date");


window.document.addEventListener('formHandler', handleForm, false)
async function handleForm(e) {
	console.log("Form data is as follows:");
	for(var pair of e.detail.entries()) {
		console.log(pair);
	 }
	 let redir = e.detail.get("redir");
	let request = new XMLHttpRequest();
	request.open("POST",redir);
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
	html:"",
	// onfocus: function () {
	// 	this.setBackground("#00AD8D");
	// },
	onblur: function () {
		this.setBackground("#00765B");
	},
};


about.addEventListener("click", () => {
	
	const box = winBox({
	title: "About Me",
	width: "400px",
	height: "400px",
	x: "center",
	url: "/about",});
});
login.addEventListener("click", () => {
	const box = winBox({
		title: "Login",
		width: "400px",
		height: "400px",
		x: "right",
		y: "bottom",
		bottom: 50,
		url: "/auth/login",});
})

const updateClock = () => {
	let now = new Date();
	let strTime = `${now.getHours()}:${now.getMinutes()}`;
	let strDate = `${now.getDate()}/${now.getMonth() + 1}/${now.getFullYear()}`;
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
	let allOpts = Object.assign({},opts,defaultOpts);
	console.log(allOpts);
	return new WinBox(allOpts);
}