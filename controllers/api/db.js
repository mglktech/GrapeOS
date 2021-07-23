const fiveM = require("../../config/api/fivem");
const discord = require("../../config/api/discord");
const database = require("../../config/db");
const logger = require("emberdyn-logger");
require("dotenv").config();
/*
Provisions:
- Server IP Address
- Discord Server ID
*/

const fiveM_getServerPlayerInfo = async (ips) => {
	// Iterates through server.fiveM.ips and returns players from first working IP address;
	for (let ip of ips) {
		// Has to be a low-level for loop in order to break out properly;
		const serverInfo = await getServerInfo(ip);
		const playerInfo = await getPlayers(ip);
		if (playerInfo) {
			return { serverInfo, playerInfo };
		}
		logger.error(`Could not retrieve player info for ${ip}`);
	}

	return null; // Returns null if no player info can be found at all IPs;
};

const getServerInfo = async (ip) => {
	try {
		const srv = new fiveM.Server(ip);
		let data = await srv.getInfo_prune();
		delete data.icon; // Rough to squeeze data for development
		data.ips = [ip];
		return data;
	} catch (err) {
		logger.warn(`fiveM Api::getServerinfo:: ${err}`);
		return null;
	}
	// let vars = new Map(Object.entries(data.vars));
	// data.vars = vars;
};

const fivem_get = async (req, res) => {
	const serverId = req.params.id;
	const server = await database.getServer(serverId);
	if (!server) {
		res.send("Error: No such server");
		return;
	}

	const fiveM_server = await fiveM_getServerPlayerInfo(server.fiveM.ips);
	if (!fiveM_server.serverInfo) {
		res.send("Server Offline");
		return;
	}
	//console.log(fiveM_server.serverInfo);
	syncServerInfo(server, fiveM_server.serverInfo);
	res.send("done");
	const players = await syncPlayerInfo(server, fiveM_server.playerInfo);
	//const hl_jobs = hl_getJobs(fiveM_server.serverInfo.vars);
	syncActivity(server._id, players);
	// Object.entries(hl_jobs).forEach(([key, value]) => {
	// 	console.log(`${key} : ${value}`);
	// });
	//console.log(players);
	// const players = await findPlayers(server._id, playerInfos); // tack on matching sv_ids from server ping
	// findDiscords(players, server._id);
	// database.updateActivity(players, serverId);
	//console.log(discords);
};

async function syncActivity(server, players) {
	const activities = await database.getActivities({
		server,
		currentlyOnline: true,
	});
	for await (let player of players) {
		//console.log(player);
		const match = await activities.some((record) => {
			// check to see whether player ID matches with this record
			// console.log(
			// 	`${record.player.toString()} ::: ${player.playerModel._id.toString()}`
			// );
			return record.player.toString() === player.playerModel._id.toString();
		});
		if (!match) {
			database.CreateActivity(server, player);
			//console.log("Creating activity");
		}
	}
	for await (let activity of activities) {
		const match = await players.some((record) => {
			//console.log(`${record.playerModel._id} ::: ${activity.player._id}`);
			return (
				record.playerModel._id.toString() === activity.player._id.toString()
			);
		});
		if (!match) {
			database.FinishActivity(activity._id);
		}
	}
	//console.log(activity);
}

async function syncPlayerInfo(server, playerInfo) {
	let players = [];
	for (let player of playerInfo) {
		const p = createPlayer(server._id, player);
		let playerModel = await database.findPlayer(p);
		players.push({ playerModel, sv_id: player.id });
	}
	return players;
}

function hl_getJobs(vars) {
	vars = Object.fromEntries(vars);
	return JSON.parse(vars["hl_onlinejobs"]);
}

function syncServerInfo(srv, serverInfo) {
	const fiveM = new Map(Object.entries(serverInfo));
	let serverObj = { fiveM };
	database.syncServer(srv, serverObj);
}

const findDiscords = async (players, id_server) => {
	// retrieves Database information on all players where player.discord._dateUpdated < a specified time and updates them synchronously
	const srv = await database.getServer(id_server);
	//const dbPlayers = await database.getAllPlayers(id_server);
	//const dcGuild = await database.guilds.fetch(guildID);
	players.forEach(async (player) => {
		const identifiers = Object.fromEntries(player.fiveM.identifiers);
		const _dateUpdated = player.discord._dateUpdated || 0;
		const now = Date.now();
		//console.log(identifiers);
		if (identifiers.discord !== undefined) {
			// console.log(
			// 	`${_dateUpdated} COMPARE ${now - process.env.discordTickRate}`
			// );
			if (_dateUpdated < now - process.env.discordTickRate) {
				let dInfo = await discord.fetchMember(
					srv.discord.id,
					identifiers.discord
				);
				if (dInfo) {
					database.updatePlayerDiscord(player._id, dInfo);
				}
			}

			//console.log(dInfo);
		}
	});
};

const createPlayer = (serverId, playerInfo) => {
	const identifiers = MapIdentifiers(playerInfo.identifiers);
	return { identifiers, name: playerInfo.name, server: serverId };
};

const getPlayers = (ip) => {
	const srv = new fiveM.Server(ip);
	return srv.getPlayersAll().catch((err) => {
		if (err.code === "ECONNABORTED") {
			logger.error(
				"[FiveM] Error ECONNABORTED, Server software caused connection abort"
			);
			//database.offlineEveryone(ip);
			return null;
			//OfflineEveryone(srv);
		}
		if (err.code === "ECONNRESET") {
			logger.error(
				"[FiveM] Error ECONNRESET, Server connection reset by server software"
			);
			//database.offlineEveryone(ip);
			return null;
		}
		if (err.code === "ECONNREFUSED") {
			//database.offlineEveryone(ip);
			logger.error("[FiveM] Error ECONNREFUSED. Server probably offline.");
			return null;
		}
		if (err.code === "ENOTFOUND") {
			logger.error(
				`[FiveM] Error ENOTFOUND. No server found at ${err.config.url}`
			);
			return null;
		}
		console.log(err);
		return null;
	});
};

const addServer = async (req, res) => {
	const ip = req.params.ip;
	const discordID = req.params.discordID.toString();
	const fiveMResponse = await findServerInfo(ip);
	const discordResponse = await discord.fetchGuild(discordID);
	if (!fiveMResponse) {
		res.json({ err: true, msg: `FiveM ERROR: No response found at ip: ${ip}` });
		return;
	}
	if (!discordResponse) {
		res.json({
			err: true,
			msg: `Discord ERROR: No Discord Guild found with id: ${discordID}`,
		});
		return;
	}
	let dbResponse = await database.findServer(ip, discordID);
	if (!dbResponse && fiveMResponse && discordResponse) {
		dbResponse = await database.saveServer(fiveMResponse, discordResponse);
	}
	res.json({ err: false, id: dbResponse._id });
};

const findServerInfo = async (ip) => {
	try {
		const srv = new fiveM.Server(ip);
		let data = await srv.getInfo_prune(ip);
		data.ips = [ip];
		return data;
	} catch (err) {
		logger.warn(`[controllers/api/db.js/findServerInfo]: ${err}`);
		return null;
	}
	// let vars = new Map(Object.entries(data.vars));
	// data.vars = vars;
};

const MapIdentifiers = (identifiers) => {
	let map = [];

	identifiers.forEach((id) => {
		const split = id.split(":");
		map.push(split);
	});
	return new Map(map);
};

module.exports = { addServer, fivem_get };
