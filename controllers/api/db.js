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

const getPlayersFromIps = (ips) => {
	for (let ip of ips) {
		// Has to be a low-level for loop in order to break out properly;
		const players = getPlayers(ip);
		if (players) {
			return players;
		}
		logger.error(`Could not retrieve server info for ${ip}`);
	}

	return null;
};

const fivem_get = async (req, res) => {
	const serverId = req.params.id;
	const server = await database.getServer(serverId);
	if (!server) {
		res.send("Error: No such server");
		return;
	}

	const playerInfos = await getPlayersFromIps(server.fiveM.ips);
	if (!playerInfos) {
		res.send("Server Offline");
		return;
	}
	res.send("success");
	const players = await findPlayers(server._id, playerInfos);
	findDiscords(players, server._id);
	database.updateActivity(players, serverId);
	//console.log(discords);
};

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

const findPlayers = async (serverId, playerInfos) => {
	let players = [];
	for (let player of playerInfos) {
		const p = createPlayer(serverId, player);
		const playerSchema = await database.findPlayer(p);
		players.push(playerSchema);
	}
	return players;
};

const createPlayer = (serverId, playerInfo) => {
	const identifiers = MapIdentifiers(playerInfo.identifiers);
	//console.log(identifiers);
	return {
		identifiers,
		name: playerInfo.name,
		server: serverId,
	};
};

const getPlayers = (ip) => {
	const srv = new fiveM.Server(ip);
	return srv.getPlayersAll().catch((err) => {
		if (err.code === "ECONNABORTED") {
			logger.error(
				"[FiveM] Error ECONNABORTED, Server software caused connection abort"
			);
			return null;
			//OfflineEveryone(srv);
		}
		if (err.code === "ECONNRESET") {
			logger.error("[FiveM] Error ECONNRESET, Server connection unsteady!");
			return null;
		}
		if (err.code === "ECONNREFUSED") {
			database.OfflineEveryone(srv._id);
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
