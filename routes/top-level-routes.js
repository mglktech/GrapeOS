const express = require("express");
const router = express.Router();

router.get("/", (req, res) =>
	res.render("pages/new_index", { sess: req.session })
);
router.get("/about", (req, res) => {
	res.render("./pages/about.ejs");
});

module.exports = router;
