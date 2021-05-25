const passport = require("passport");
const genPassword = require("../config/passwordUtils").genPassword;
const User = require("../models/user-model");

const setup = async (req, res) => {
	// const exists = await User.exists({ username: process.env.super_USERNAME });
	// if (exists) {
	// 	console.log("Admin account already exists!");
	// 	res.redirect("/login");
	// 	return;
	// }
	const saltHash = genPassword(process.env.super_PASSWORD);
	const salt = saltHash.salt;
	const hash = saltHash.hash;
	const newUser = new User({
		username: process.env.super_USERNAME,
		hash: hash,
		salt: salt,
		admin: true,
	});
	console.log(`Creating admin account:`);
	console.log(newUser);
	newUser
		.save()
		.then((user) => {
			console.log(`ADMIN ACCOUNT CREATED: ${user}`);
			res.redirect("/auth/login");
		})
		.catch((err) => {
			console.log(`ERROR: 	${err}`);
			res.redirect("/auth/login");
		});
};

const login_get = (req, res) => {
	const response = {
		err: req.query.err,
	};
	res.render("pages/login", response);
};

const logout_get = (req, res) => {
	req.logout();
	res.redirect("/");
};

const login_post = (req, res) => {
	const redirs = {
		successRedirect: "/",
		failureRedirect: "/login?err=true",
	};
	passport.authenticate("local", redirs),
		function (req, res) {
			console.log(`${req.user.username} has logged in.`);
		};
};

module.exports = {
	login_get,
	logout_get,
	login_post,
	setup,
};
