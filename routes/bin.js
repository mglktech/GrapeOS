const express = require("express");
const router = express.Router();
const isAuth = require("../config/auth").isAuth;
const isAdmin = require("../config/auth").isAdmin;
const db = require("../config/db");
const cron = require("../models/crontask-model");
const icons = require("../models/icon-model");
const shortcuts = require("../models/shortcut-model");
const files = require("../models/file-model");
const use = (fn) => (req, res, next) => {
	Promise.resolve(fn(req, res, next)).catch(next);
};
/*
----Renderers----
*/
// Task Manager
router.get(
	"/tasks/view",
	isAdmin,
	use(async (req, res) => {
		let tasks = await cron.getAll();
		res.render("bin/task-manager/view-tasks", { tasks });
	})
);
router.get(
	"/tasks/add",
	isAdmin,
	use((req, res) => {
		res.render("bin/task-manager/add-task");
	})
);
router.get(
	"/tasks/info/:id",
	isAdmin,
	use(async (req, res) => {
		let task = await cron.getById(req.params.id);
		res.render("bin/task-manager/task-info", { task });
	})
);
/*
----JSON responses----
*/
router.get(
	"/tasks/get",
	isAdmin,
	use(async (req, res) => {
		let tasks = await cron.getAll();
		//console.log(tasks);
		res.json(tasks);
	})
);
/*
 ----Redirects----
*/
router.post(
	"/tasks/add",
	isAdmin,
	use((req, res) => {
		const task = {
			name: req.body.name,
			exp: req.body.exp,
			cmd: req.body.cmd,
			data: JSON.parse(req.body.data),
			enabled: false,
		};
		cron.add(task);
		res.redirect("/bin/tasks/view");
	})
);
router.get(
	"/tasks/toggle/:id",
	isAdmin,
	use(async (req, res) => {
		await cron.toggle(req.params.id);
		res.redirect("/bin/tasks/view");
	})
);
router.get(
	"/tasks/delete/:id",
	isAdmin,
	use(async (req, res) => {
		await cron.delete(req.params.id);
		res.redirect("/bin/tasks/view");
	})
);

/*
---- Icon Manager ----
*/
router.get(
	"/icons/view",
	isAdmin,
	use(async (req, res) => {
		let iconData = await files.getFiles({type:"icon"});
		res.render("bin/icon-manager/icons-view", { icons: iconData });
	})
);
router.get(
	"/icons/add",
	isAdmin,
	use((req, res) => {
		res.render("bin/icon-manager/icons-add");
	})
);

router.post(
	"/icons/add",
	isAdmin,
	use((req, res) => {
		const new_icon = {
			name: req.body.iconName,
			iconType: req.body.iconType,
			iconTypeData: req.body.iconTypeData,
		};
		files.addIcon(new_icon);
		res.redirect("/bin/icons/view");
	})
);

/*
Shortcut Manager
*/
router.get(
	"/shortcuts/get/:id", isAdmin, use(async(req,res) => {
		let file = await files.getShortcut({_id:req.params.id});
		res.json(file);
	})
);

router.get(
	"/shortcuts/view",
	isAdmin,
	use(async (req, res) => {
		let allShortcuts = await files.getShortcuts({},false);
		//console.log(allShortcuts);
		res.render("bin/shortcut-manager/shortcut-view", {
			shortcuts: allShortcuts,
		});
	})
);
router.get(
	"/shortcuts/add",
	isAdmin,
	use(async (req, res) => {
		const allicons = await files.getFiles({type: "icon"});
		res.render("bin/shortcut-manager/shortcut-add", { icons: allicons });
	})
);

router.post(
	"/shortcuts/add",
	isAdmin,
	use((req, res) => {

		let new_file = {
			name: req.body.name, // short name for selection
			type:"shortcut",
			data: {
				icon: req.body.icon,
				desktopVisible:cbtf(req.body.desktopVisible),
				requireAuth:cbtf(req.body.requireAuth),
				requireAdmin:cbtf(req.body.requireAdmin),
				winbox: {
					title: req.body["winbox.title"],
					width: req.body["winbox.width"],
					height: req.body["winbox.height"],
					url: req.body["winbox.url"],
			},
			}};
		console.log(new_file);
		files.addShortcut(new_file);
		res.redirect("/bin/shortcuts/view");
	})
	
);
router.get(
	"/files/get/:id", isAdmin, use(async(req,res) => {
		let file = await files.getFile({_id:req.params.id});
		res.json(file);
	})
);
router.post("/files/remove/:id", isAdmin, use((req,res)=>{
	const _id = req.params.id;
	files.findByIdAndRemove(_id).then((r) => {
		res.redirect("/bin/shortcuts/view");
	});
	

}));

router.get(
	"/folders/view",isAdmin,
	use(async (req, res) => {
		let allFolders = await files.getFolders({});
		//console.log(allFolders);
		res.render("bin/folder-manager/folders-view", {
			folders: allFolders,
		});
	})
);
router.get(
	"/folders/add",
	isAdmin,
	use(async (req, res) => {
		res.render("bin/folder-manager/folders-add", {  });
	})
);
router.post(
	"/folders/add",
	isAdmin,
	use(async (req, res) => {
		const filesStringArray = JSON.parse(req.body.files);
		let fileIDS = [];
		for(let string of filesStringArray) {
			const properFile = await files.findOne({_id:string});
			fileIDS.push(properFile._id);
		}
		let new_folder = {
			name: req.body.name, // short name for selection
			type:"folder",
			data: {
				desktopVisible:cbtf(req.body.desktopVisible),
				requireAuth:cbtf(req.body.requireAuth),
				requireAdmin:cbtf(req.body.requireAdmin),
				files:fileIDS,
			}};
		console.log(new_folder);
		files.addShortcut(new_folder);
		res.redirect("/bin/folders/view");
	})
	
);

function cbtf(val) { // Checkbox True/False <-- because checkboxes return "on" if true...
	if(val) {
		return true;
	}
	else {
		return false;
	}
}

module.exports = router;
