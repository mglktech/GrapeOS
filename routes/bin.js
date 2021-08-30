const express = require("express");
const router = express.Router();
const isAuth = require("../config/auth").isAuth;
const isAdmin = require("../config/auth").isAdmin;
const db = require("../config/db");
const cron = require("../models/crontask-model");

router.get("/tasks/get", isAdmin, async (req, res) => {
	let tasks = await cron.getAll();
	//console.log(tasks);
	res.json(tasks);
});

router.get("/tasks/add", isAdmin, (req, res) => {
	res.render("bin/add-task");
});
router.post("/tasks/add", isAdmin, (req, res) => {
	const task = {
		name: req.body.name,
		exp: req.body.exp,
		cmd: req.body.cmd,
		data: JSON.parse(req.body.data),
		enabled: false,
	};
	cron.add(task);
	res.redirect("/bin/tasks/view");
});

router.get("/tasks/view", isAdmin, async (req, res) => {
	let tasks = await cron.getAll();
	res.render("bin/view-tasks", { tasks });
});
router.get("/tasks/info/:id", isAdmin, async (req, res) => {
	let task = await cron.getById(req.params.id);
	res.render("bin/task-info", { task });
});
router.get("/tasks/toggle/:id", isAdmin, async (req, res) => {
	await cron.toggle(req.params.id);
	res.redirect("/bin/tasks/view");
});
router.get("/tasks/delete/:id", isAdmin, async (req, res) => {
	await cron.delete(req.params.id);
	res.redirect("/bin/tasks/view");
});

module.exports = router;
