module.exports.isAuth = async (req, res, next) => {
	if (req.isAuthenticated()) {
		next();
		return;
	}
	console.log(
		"A User tried to load a page that was restricted. Their session details are as follows: "
	);
	console.log(req.session);
	res.redirect("/auth/login");
};
module.exports.isAdmin = async (req, res, next) => {
	if (req.isAuthenticated() && req.user.admin) {
		next();
		return;
	}
	res
		.status(404)
		.send(
			"You are not authorised to view this content. (you are not an admin)"
		);
};
