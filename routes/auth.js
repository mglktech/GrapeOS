const router = require("express").Router();
const passport = require("passport");
const controller = require("../controllers/auth");

router.get("/login", controller.login_get);
router.get("/login/setup", controller.setup);
router.get("/logout", controller.logout_get);

router.post(
	"/login",
	passport.authenticate("local", { failureRedirect: "/login" }),
	function (req, res) {
		console.log(`${req.user.username} has logged in.`);
		res.redirect("/"); // Successful auth
	}
);
module.exports = router;
