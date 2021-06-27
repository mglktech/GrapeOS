const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const modelName = "Activity";
const mySchema = new Schema(
	{
		server: {
			type: Schema.ObjectId,
			ref: "Server",
		},
		player: {
			type: Schema.ObjectId,
			ref: "Player",
		},
		sessionId: Number,
		onlineAt: Number,
		offlineAt: Number,
		currentlyOnline: Boolean,
		duration: Number,
	},
	{ timestamps: true }
);

// create model based on schema
const model = mongoose.model(modelName, mySchema);

module.exports = model;
