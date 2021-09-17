const mongoose = require("mongoose");

const Schema = mongoose.Schema;

// make schema, defines structure
const userSchema = new Schema(
	{
		username: {
			type: String,
			required: true,
		},
		hash: {
			type: String,
			required: true,
		},
		salt: {
			type: String,
			required: true,
		},
		alias: String,
		admin: {
			type: Boolean,
			default: false,
		},
	},
	{ timestamps: true }
);

// create model based on schema
const User = mongoose.model("User", userSchema);

User.setup = async () => {
	const exists = await User.exists({ username: process.env.super_USERNAME });
	if (exists) {
		return false;
	}
	const saltHash = genPassword(process.env.super_PASSWORD);
	const salt = saltHash.salt;
	const hash = saltHash.hash;
	new User({
		username: process.env.super_USERNAME,
		hash: hash,
		salt: salt,
		admin: true,
	})
		.save()
		.then(() => {
			console.log(
				"An Administrator account has been created using .env super_USERNAME and super_PASSWORD."
			);
		});
	return true;
};

module.exports = User;
