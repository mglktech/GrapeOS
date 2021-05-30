module.exports.isAuth = async (req, res, next) => {
	if (req.isAuthenticated()) {
		next();
		return;
	}
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
