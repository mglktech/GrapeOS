const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const modelName = "fivem-player"; // Singular, not sure if capitals are relevant
// make schema, defines structure

const mySchema = new Schema({
	identifiers: { type: Map, of: String },
	name: String,
	server: { type: Schema.Types.ObjectId, ref: "fivem-server" },
	online: Boolean,
});
// create model based on schema
const model = mongoose.model(modelName, mySchema);

// assign model constants
model.create = () => {};
model.findPlayer = async (playerInfo) => {
	// find player that matches one of the identifiers
	const steamID = Object.fromEntries(playerInfo.identifiers).steam;
	//console.log(discordID);
	return model.findOneAndUpdate(playerInfo, playerInfo, {
		new: true,
		upsert: true,
	});
};

module.exports = model;
