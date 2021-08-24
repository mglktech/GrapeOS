const express = require("express");
const router = express.Router();

router.get("/", (req, res) => res.redirect("/welcome"));
router.get("/welcome", (req, res) => {
	res.render("pages/welcome");
});

module.exports = router;
