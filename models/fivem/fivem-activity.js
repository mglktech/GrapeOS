const mongoose = require("mongoose");
const logger = require("emberdyn-logger");
const Schema = mongoose.Schema;

const modelName = "fivem-activity";
const mySchema = new Schema(
	{
		server: {
			type: Schema.ObjectId,
			ref: "fivem-server",
		},
		player: {
			type: Schema.ObjectId,
			ref: "fivem-player",
		},
		onlineAt: Number,
		offlineAt: Number,
		online: Boolean,
		sv_id: Number,
	},
	{ timestamps: false }
);

// create model based on schema
const model = mongoose.model(modelName, mySchema);

model.create = (params) => {
	// create new dbActivity
	params.onlineAt = Date.now();
	params.online = true;
	return new model(params).save();
};

model.getAllOnline = (server) => {
	return model.find({ server, online: true });
};

model.finish = (_id) => {
	const now = Date.now();
	return model
		.findByIdAndUpdate(_id, {
			online: false,
			offlineAt: now,
		})
		.populate("player")
		.populate("server")
		.then((res) => {
			console.log(`${res.player.name} has logged out of ${res.server.ip}`);
		});
};
model.finishAll = async (server) => {
	const records = await model.getAllOnline(server);
	logger.event("Sending " + records.length + " players offline...");
	for (let r of records) {
		model.finish(r._id);
	}
};

module.exports = model;
