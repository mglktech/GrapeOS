const express = require("express");
const router = express.Router();

router.get("/", (req, res) => res.redirect("/welcome"));
router.get("/welcome", (req, res) => {
	res.render("pages/welcome");
});
router.get("/home", (req, res) => {
	if (req.isAuthenticated() && req.user.admin) {
		res.render("desktops/index_admin");
		return;
	} else if (req.isAuthenticated()) {
		res.render("desktops/index_auth");
		return;
	}
	res.render("desktops/default");
});

module.exports = router;
