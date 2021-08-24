const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const modelName = "Crontask";
const mySchema = new Schema(
	{
		name: String,
		exp: String,
		cmd: String,
		data: { type: Map, of: String },
		enabled: Boolean,
	},
	{ timestamps: false }
);

// create model based on schema
const model = mongoose.model(modelName, mySchema);

module.exports = model;
