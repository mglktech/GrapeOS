// Gameservers = Associated content for a specific community
// in the case of Highlife Roleplay, information scrubbed from their discord server is associated with their live server IP.
// Model relevant player-related content from the discord server like roles,
// Associate roles with discord accounts
// Be able to check almost-live up to date information on each player on the server and their associated roles.

const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const modelName = "Server"; // Singular, not sure if capitals are relevant
// make schema, defines structure
const mySchema = new Schema(
	{
		ip: String,
		online: Boolean,
		info: {
			enhancedHostSupport: Boolean,
			icon: String,
			resources: [String],
			server: String,
			vars: {
				type: Map,
				of: String,
			},
			version: Number,
		},
		players: [
			{
				current_id: Number,
				name: String,
				online: Boolean,
				ping: Number,
				identifiers: [String],
				lastCameOnline: Number,
				activity: [
					{
						onlineAt: Number,
						offlineAt: Number,
						duration: {
							type: Number,
							default: function () {
								return this.offlineAt - this.onlineAt;
							},
						},
						session_id: Number,
					},
				],
			},
		],
	},
	{ timestamps: true }
);

// create model based on schema
const model = mongoose.model(modelName, mySchema);

module.exports = model;
