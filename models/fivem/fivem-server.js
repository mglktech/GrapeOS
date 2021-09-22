// Gameservers = Associated content for a specific community
// in the case of Highlife Roleplay, information scrubbed from their discord server is associated with their live server IP.
// Model relevant player-related content from the discord server like roles,
// Associate roles with discord accounts
// Be able to check almost-live up to date information on each player on the server and their associated roles.

const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const modelName = "fivem-server";

const mySchema = new Schema({
	ip: String,
	resources: [String],
	enhancedHostSupport: Boolean,
	icon: String,
	server: String,
	vars: {
		type: Map,
		of: Object,
	},
	online: Boolean,
	retries:Number,
});

// create model based on schema
const model = mongoose.model(modelName, mySchema);

model.fetchAll = () => {
	return objectify(model.find());
}

model.fetchById = (id) => {
	//console.log("new method");
	return objectify(model.findById(id));
};
model.fetchByIP = (ip) => {
	return objectify(model.findOne({ ip }));
};

model.create = (item) => {
	return new model(item).save()
	.then(res => {
		doLog("fivem-server", `New Model Created. ${res._id}`);
		return res;
	})
}
model.modify = (id,contents) => {
	model.findByIdAndUpdate(id,contents);
}

model.setStatus = (sv, status) => { // sv = found server model, status = Online Status (bool)
	let retries = sv.retries;
	if(!status) {
		retries++;
		let name = sv.vars.sv_projectName || sv._id;
		console.log(`[fivem-server] -> ${name} has failed to respond after ${retries} retries.`);
	}
	else {
		retries = 0;
	}
	model.findByIdAndUpdate(sv._id, {status, retries}).exec();
}


function objectify(item) {
	try {
		item.toObject({flattenMaps:true});
	}
	catch {
		return;
	}
}

function doLog(service,text) {
	let logTxt = `[${service}] -> ${text}`;
	console.log(logTxt);
}
module.exports = model;

// const myOldSchema = new Schema(
// 	{
// 		ip: String,
// 		online: Boolean,
// 		info: {
// 			enhancedHostSupport: Boolean,
// 			icon: String,
// 			resources: [String],
// 			server: String,
// 			vars: {
// 				type: Map,
// 				of: String,
// 			},
// 			version: Number,
// 		},
// 		players: [
// 			{
// 				current_id: Number,
// 				name: String,
// 				online: Boolean,
// 				ping: Number,
// 				identifiers: [String],
// 				lastCameOnline: Number,
// 				activity: [
// 					{
// 						onlineAt: Number,
// 						offlineAt: Number,
// 						duration: {
// 							type: Number,
// 							default: function () {
// 								return this.offlineAt - this.onlineAt;
// 							},
// 						},
// 						session_id: Number,
// 					},
// 				],
// 			},
// 		],
// 	},
// 	{ timestamps: true }
// );
