const router = require("express").Router();
const passport = require("passport");
const controller = require("../controllers/auth");
const isAuth = require("../config/auth").isAuth;
const isAdmin = require("../config/auth").isAdmin;

router.get("/login", controller.login_get);
router.get("/create", function () {});
router.get("/home", function () {});
router.get("/login/setup", controller.setup);
router.get("/logout", controller.logout_get);
//router.get("/login-success", isAuth, controller.loginSuccess_get);

router.post(
	"/login",
	passport.authenticate("local", { failureRedirect: "/auth/login" }),
	function (req, res) {
		console.log(`${req.user.username} has logged in.`);
		res.redirect("/home");
	}
);
module.exports = router;
