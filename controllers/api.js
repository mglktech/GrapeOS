require("dotenv").config();
const FiveM_Module = require("../config/api/fivem");
const Discord = require("discord.js");
const client = new Discord.Client({ _tokenType: "" });
const token = process.env.discord_token;
const guildID = process.env.guild_id;
const ip = process.env.fivem_ip_hl;
const srv = new FiveM_Module.Server(ip);

const serverModel = require("../models/server-model");
const playerModel = require("../models/player-model");
const activityModel = require("../models/activity-model");

const index_get = (req, res) => {
	res.sendStatus(200);
};

const fivem_get = (req, res) => {
	srv
		.getInfo()
		.then((data) => {
			res.json(data);
		})
		.catch((err) => {
			console.log(`ERROR: \n ${err}`);
			res.json(err);
		});
};
const fivem_getPlayerCount = async (req, res) => {
	let first = await srv
		.getPlayers()
		.then((data) => {
			return data;
		})
		.catch((err) => {
			if (err.code == "ECONNABORTED");
			//res.json(err);
		});
	let second = await srv.getMaxPlayers().then((data) => {
		return data;
	});
	res.json({ playerCount: first, maxPlayers: second });
};

const fivem_getPlayersAll = async (req, res) => {
	// first, pull/make new server
	const serverInfo = await updateServerInfo(ip); //
	if (!serverInfo) {
		res.json({ error: "Server Offline" });
		// set everyone offline in database?
		return;
	}
	const playerData = await GetPlayers(srv);
	const srv_currentlyOnline = [];
	const server = await serverModel.findOne({ ip }).exec();
	playerData.forEach(async (player) => {
		const cap = await CapturePlayerInfo(player);
		//console.log(cap);
		srv_currentlyOnline.push(cap);
		//console.log(`${srv_currentlyOnline.length}/${playerData.length}`);
		if (srv_currentlyOnline.length == playerData.length) {
			chkActivity(srv_currentlyOnline, server);
			res.json(srv_currentlyOnline);
			//perform database search fr all with currentlyOnline set to true, compare results.
		}
	});
};

const findPlayer = () => {};

async function chkActivity(sv_online, server) {
	const curTime = Date.now();
	const db_online = await activityModel
		.find({ server, currentlyOnline: true })
		.exec();
	//console.log(db_online);
	let count = 1;
	// What if server goes offline??? Must set all existing online to offline if that is the case.
	sv_online.forEach(async (id) => {
		const player = await playerModel.findById(id).exec();
		const exists = db_online.some((record) => {
			//console.log(`> ${record.player} ::: ${id} <`);
			return record.player.toString() == id.toString();
		});
		//console.log(exists);
		if (!exists) {
			CreateActivityModel(server, player);
		}
		if (count === sv_online.length) {
			UpdateActivityModel(server, sv_online);
		}
		//console.log(`${count}/${sv_online.length}`);
		count++;
	});
	//UpdateActivityModel(server, sv_online);
}

async function UpdateActivityModel(server, sv_online) {
	const now = Date.now();
	const db_online = await activityModel
		.find({ server, currentlyOnline: true })
		.exec();
	//console.log(db_online);
	db_online.forEach(async (record) => {
		const exists = sv_online.some((sv_record) => {
			//console.log(`> ${record.player} ::: ${id} <`);
			return sv_record == record.player.toString();
		});
		if (!exists) {
			const player = await getPlayer(record.player);
			console.log(`${player.name} (${player._id}) has gone offline`);
			const mod = await activityModel.findOne({ _id: record._id }).exec();
			const duration = now - mod.onlineAt;
			const model = await activityModel
				.findOneAndUpdate(
					{ _id: record._id },
					{
						offlineAt: now,
						duration,
						currentlyOnline: false,
					}
				)
				.exec();
		}
	});
}

async function getPlayer(id) {
	const player = await playerModel.findById(id).exec();
	return player;
}

async function CreateActivityModel(server, player) {
	const onlineAt = Date.now();
	const newActivityModel = await new activityModel({
		server,
		player,
		onlineAt,
		currentlyOnline: true,
	}).save();
	console.log(
		`${newActivityModel.player.name} (${player._id}) has come online`
	);
	return newActivityModel;
}

//{"endpoint":"127.0.0.1","id":69,"identifiers":["steam:11000013c929d44","license:d218507f7cd94c1db39282d472dd7b5d3d81149e","xbl:2535471629942129","live:914798172291422","discord:780633822081056769","fivem:1625291","license2:d218507f7cd94c1db39282d472dd7b5d3d81149e"],"name":"Obama","ping":105},

//{"endpoint":"127.0.0.1","id":9,"identifiers":["steam:11000014734ec8d","license:d218507f7cd94c1db39282d472dd7b5d3d81149e","xbl:2535412091651842","live:914798291850613","discord:558737326147239937","fivem:1625291","license2:d218507f7cd94c1db39282d472dd7b5d3d81149e"],"name":"Solar","ping":105}

// these two users have the same license, fivem, and license2. I will need to accommodate for this.

const fivem_getOnline = (req, res) => {
	srv
		.getServerStatus()
		.then((data) => res.json(data))
		.catch((err) => {
			if (err.code == "ECONNABORTED");
			res.json(err);
		});
};

const CapturePlayerInfo = async (player) => {
	// first compare player identifiers to database (singular)
	const identifiers = MapIdentifiers(player.identifiers);
	const database = await playerModel
		.findOne({ "identifiers.steam": Object.fromEntries(identifiers).steam })
		.exec();
	// console.log(database);
	if (database === null) {
		let id = "";
		const model = await new playerModel({
			identifiers,
			identifiersArray: player.identifiers,
			name: player.name,
		})
			.save()
			.then((result) => {
				console.log(`${result.name} (${result._id}) has been discovered!`);
				return result._id;
			});
		return model._id;
	}
	if (
		!compareObjects(
			Object.fromEntries(identifiers),
			Object.fromEntries(database.identifiers)
		) // If the player identifiers have been modified
	) {
		await playerModel
			.findByIdAndUpdate(database._id, {
				identifiers,
				identifiersArray: player.identifiers,
			})
			.exec();
		console.log(`${player.name} has had their licenses updated.`);
	}
	return database._id;
};

const compareObjects = (o1, o2) => {
	// https://stackoverflow.com/a/5859028
	for (var p in o1) {
		if (o1.hasOwnProperty(p)) {
			if (o1[p] !== o2[p]) {
				return false;
			}
		}
	}
	for (var p in o2) {
		if (o2.hasOwnProperty(p)) {
			if (o1[p] !== o2[p]) {
				return false;
			}
		}
	}
	return true;
};

async function findServer(ip) {
	return await serverModel.findOne({ ip }).exec();
}

async function createServer(ip, data) {
	let vars = new Map(Object.entries(data.vars));
	const sv = await new serverModel({
		ip,
		info: {
			enhancedHostSupport: data.enhancedHostSupport,
			icon: data.icon,
			resources: data.resources,
			server: data.server,
			vars,
			version: data.version,
		},
	}).save();
	return sv;
}
const getServerInfo = async (srv) => {
	return await srv
		.getInfo()
		.then((data) => {
			return data;
		})
		.catch((err) => {
			if (err.code === "ECONNABORTED") {
				console.log(
					"[FiveM] Error ECONNABORTED, Server software caused connection abort"
				);
				return null;
				//OfflineEveryone(srv);
			}
			if (err.code === "ECONNRESET") {
				console.log("[FiveM] Error ECONNRESET, Server connection unsteady!");
				return null;
			}
			if (err.code === "ECONNREFUSED") {
				OfflineEveryone(srv);
				console.log("[FiveM] Error ECONNREFUSED. Server probably offline.");
				return null;
			}
			console.log(err);
			return null;
		});
};

async function OfflineEveryone(srv) {
	const now = Date.now();
	const server = await findServer(srv.ip);
	const records = await activityModel
		.find({ server, currentlyOnline: true })
		.exec();
	records.forEach(async (record) => {
		const mod = await activityModel.findOne({ _id: record._id }).exec();
		const duration = now - mod.onlineAt;
		activityModel
			.findByIdAndUpdate(record._id, {
				offlineAt: now,
				duration,
				currentlyOnline: false,
			})
			.exec();
		const player = await getPlayer(record.player);
		console.log(
			`${player.name} (${player._id}) has gone offline due to server not responding`
		);
	});
}

async function updateServerInfo(ip) {
	const data = await getServerInfo(srv); // srv is top-level defined
	if (!data) {
		console.log("[FiveM_API] Error: could not retrieve server info");
		return null;
	}
	let server = await findServer(ip);
	if (!server) {
		server = await createServer(ip, data);
	}

	let vars = new Map(Object.entries(data.vars));
	let new_data = {
		info: {
			enhancedHostSupport: data.enhancedHostSupport,
			icon: data.icon,
			resources: data.resources,
			server: data.server,
			vars,
			version: data.version,
		},
	};
	//console.log(new_data);
	serverModel.findByIdAndUpdate(server._id, new_data).exec();
	return data;
}

const CaptureServerInfo = async (ip, data) => {
	// now updateServerInfo
	const mongoData = await serverModel
		.findOne({ ip })
		.then((result) => {
			return result;
		})
		.catch((err) => {
			console.log(err);
		});
	//console.log(mongoData);
	if (mongoData === null) {
		console.log("New IP Address detected for FiveM Server. Saving...");
		let vars = new Map(Object.entries(data.vars));
		const sv = new serverModel({
			ip,
			info: {
				enhancedHostSupport: data.enhancedHostSupport,
				icon: data.icon,
				resources: data.resources,
				server: data.server,
				vars,
				version: data.version,
			},
		})
			.save()
			.then((result) => console.log("Fivem Server Save Successful!"))
			.catch((err) => console.log(err));
	}
};

const GetPlayers = (srv) => {
	return srv
		.getPlayersAll()
		.then((data) => {
			return data;
		})
		.catch((err) => {
			if (err.code === "ECONNABORTED") {
				console.log(`Error connecting to server at url: ${err.config.url}`);
				return [];
			}
			console.log(err);
			return [];
		});
};

const MapIdentifiers = (identifiers) => {
	let map = [];

	identifiers.forEach((id) => {
		const split = id.split(":");
		map.push(split);
	});
	return new Map(map);
};

module.exports = {
	index_get,
	fivem_get,
	fivem_getPlayersAll,
	fivem_getOnline,
	fivem_getPlayerCount,
};
