const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const modelName = "Player"; // Singular, not sure if capitals are relevant
// make schema, defines structure
const mySchema = new Schema(
	{
		identifiers: {
			type: Map,
			of: String,
		},
		identifiersArray: [String],
		name: String,
		aliases: [String],
	},
	{ timestamps: true }
);

// create model based on schema
const model = mongoose.model(modelName, mySchema);

module.exports = model;
