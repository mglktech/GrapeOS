const mongoose = require("mongoose");
const funcs = require("../bin/funcs/mongoose-funcs");
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
	{
		timestamps: false,
	}
);

// create model based on schema
const model = mongoose.model(modelName, mySchema);

model.getAll = async () => {
	return funcs.ConvertToObjects(await model.find());
};
model.getById = async (_id) => {
	let cron = await model.findById(_id);
	return cron.toObject({ flattenMaps: true });
};

model.toggle = async (_id) => {
	let cron = await model.findById(_id);
	if (cron) {
		cron.enabled = !cron.enabled;
		cron.save();
	}
	return cron.data.id;
};

model.add = (cron) => {
	const newCronJob = new model(cron);
	console.log("New CRON:");
	console.log(newCronJob);
	newCronJob.save();
};

model.delete = (_id) => {
	model.findByIdAndRemove(_id).then((res) => {
		console.log("CRON Removed: " + _id);
	});
};

module.exports = model;
