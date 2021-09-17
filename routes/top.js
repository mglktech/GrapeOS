const express = require("express");
const router = express.Router();
const shortcuts = require("../models/shortcut-model");
const files = require("../models/file-model");

router.get("/", (req, res) => res.redirect("/welcome"));
router.get("/welcome", (req, res) => {
	res.render("pages/welcome");
});
router.get("/home", async (req, res) => {
	let scs = [];
	if (req.isAuthenticated() && req.user.admin) {
		// Collect apps from database belonging to Admin?
		// collect apps based on JS object?
		scs = await files.getShortcuts({ "data.requireAdmin": true });
		//console.log(scs);
	} else if (req.isAuthenticated()) {
		scs = await shortcuts.getAllPublic();
	} else {
		scs = await files.getShortcuts({ "data.requireAuth": false });
	}
	
	
	res.render("desktops/new_default", { scs });
});

router.get("/about", (req, res) => {
	res.render("pages/about");
});
module.exports = router;
