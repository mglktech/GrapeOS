const passport = require("passport");

let router = require("express").Router();
const use = (fn) => (req, res, next) => {
	Promise.resolve(fn(req, res, next)).catch(next);
};
router.get("/" , passport.authenticate("discord"));
router.get("/redirect", passport.authenticate("discord", {
    failureRedirect:"/",
    successRedirect:"/home",
}));


module.exports = router;