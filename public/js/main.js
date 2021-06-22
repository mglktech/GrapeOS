const about = document.querySelector("#about");

const time = document.querySelector("#time");
const date = document.querySelector("#date");

about.addEventListener("click", () => {
	const aboutBox = new WinBox({
		title: "About Me",
		// modal: true,
		width: "400px",
		height: "400px",
		x: "center",
		// top: 50,
		// right: 50,
		// bottom: 50,
		// left: 50,
		url: "/about",
		// onfocus: function () {
		// 	this.setBackground("#00AD8D");
		// },
		onblur: function () {
			this.setBackground("#00765B");
		},
	});
});

const updateClock = () => {
	let now = new Date();
	let strTime = `${now.getHours()}:${now.getMinutes()}`;
	let strDate = `${now.getDate()}/${now.getMonth() + 1}/${now.getFullYear()}`;
	time.innerHTML = strTime;
	date.innerHTML = strDate;
};

const initClock = () => {
	window.setInterval("updateClock()", 1000);
};

date.addEventListener("load", initClock());
