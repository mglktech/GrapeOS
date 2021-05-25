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

module.exports = User;
