const CronJobManager = require("cron-job-manager");
const api = require("../controllers/api.js");
const logger = require("emberdyn-logger");
const db = require("../config/db");

const syncTasks = async () => {
	let tasks = await db.getCrons();
	for (let task of tasks) {
		syncTaskToEnabledFlag(task);
	}
};

const syncTaskToEnabledFlag = (task) => {
	if (!manager.exists(task._id.toString())) {
		createTask(task);
		return;
	}
	let id = task._id.toString();
	let running = manager.jobs[id].running || false;
	let enabled = task.enabled;
	//console.log(manager);
	//console.log(task);
	//console.log(`id: ${id} running: ${running} enabled: ${enabled}`);
	if (running == false && enabled == true) {
		manager.jobs[id].start();
		console.log(`Job ID: ${id} started.`);
	}
	if (running == true && enabled == false) {
		manager.jobs[id].stop();
		console.log(`Job ID: ${id} stopped.`);
	}
};

const createTask = (task) => {
	if (task.cmd == "pingFiveMServer") {
		manager.add(task._id.toString(), task.exp, function () {
			api.fivem_cron_get(task.data.id);
		});
		console.log(
			`Job ID: ${task._id.toString()} has been created. (pingFiveMServer)`
		);
	}
	if (task.cmd == "pingScrobbler") {
		manager.add(task._id.toString(), task.exp, function () {});
		console.log(
			`Job ID: ${task._id.toString()} has been created. (pingScrobbler)`
		);
	}
};

const scheduledTasks = [
	// {
	// 	exp: "*/30 * * * * *",
	// 	cmd: "pingFiveMServer",
	// 	data: {
	// 		// Data structure depends on the cmd given.
	// 		id: "60e454bed30b9e2538de42cd", // Highlife server ID on Dev
	// 	},
	// 	active: true,
	// },
	// {
	// 	exp: "*/5 * * * * *",
	// 	cmd: "pingScrobbler",
	// 	data: {
	// 		// Data structure depends on the cmd given.
	// 		user: "mglkdottech",
	// 		api_key: "f2ef563e9f5436998cf6a5139b902bf1", // Highlife server ID on Dev
	// 	},
	// 	active: true,
	// },
];

const ScheduleTask = (task) => {
	if (task.cmd == "pingFiveMServer") {
		var job = new CronJob(
			task.exp,
			function () {
				api.fivem_cron_get(task.data.id);
			},
			null,
			true
		);

		job.start();
	}
	if (task.cmd == "pingScrobbler") {
		let job = new CronJob(
			task.exp,
			function () {
				//logger.info("Ping " + task.data.api_key);
			},
			null,
			true
		);

		job.start();
	}
	logger.info(task.cmd + " successfully initialized.");
};

const ScheduleTasks = (tasks) => {
	for (let task of tasks) {
		ScheduleTask(task);
	}
};

const MapItems = (items) => {
	let map = [];

	items.forEach((id) => {
		const split = id.split(":");
		map.push(split);
	});
	return new Map(map);
};

let manager = new CronJobManager("head", "* * * * * *", syncTasks, {
	start: true,
});

module.exports = manager;
