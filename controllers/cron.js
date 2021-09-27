const FiveMServerModel = require("../models/fivem/fivem-server");
const FiveMPlayerModel = require("../models/fivem/fivem-player");
const FiveMActivityModel = require("../models/fivem/fivem-activity");
const maxRetries = process.env.maxRetries || 3;

const pingFiveMServer = async (serverId) => {
	const FiveMService = require("../services/fiveM");

	const FiveMServer = await FiveMServerModel.getById(serverId);

	if (!FiveMServer) {
		console.log(`Error: No Server found for _id:${serverId}`);
		return;
	}
	const srv = new FiveMService.Server(FiveMServer.ip);

	const serverInfo = await srv.getInfo().catch((err) => {
		console.log(
			`Error: No Server Info recieved for ${FiveMServer.ip} [${err.code}]`
		);
		return;
	});
	if (!serverInfo) {
		return;
	}

	//console.log(serverInfo);

	syncServerInfo(FiveMServer, serverInfo);

	const playerInfo = await srv.getPlayers();
	let a = Date.now();
	const players = [];
	for (let player of playerInfo) {
		const p = createPlayer(player);
	}
	//console.log(players);
	for (let player of players) {
		const p = createPlayer(player);
		let playerModel = await FiveMPlayerModel.findPlayer(p);
		let dbActivity = await FiveMActivityModel.findOne({
			player: playerModel._id,
			online: true,
		});
		if (!dbActivity) {
			FiveMActivityModel.create({
				server: FiveMServer._id,
				player: playerModel._id,
				sv_id: player.sv_id,
			});
			console.log(`${playerModel.name} has logged into ${FiveMServer.ip}`);
		} else if (dbActivity.sv_id != player.sv_id) {
			// Server id Mismatch on player, put them offline.(they will come online with new sv_id next cycle)
			FiveMActivityModel.finish(dbActivity._id);
		}
		// Move onto next player
	}
	const dbActivities = await FiveMActivityModel.find({
		server: FiveMServer._id,
		online: true,
	}).populate("player");
	//console.log(dbActivities);
	for (let activity of dbActivities) {
		const found = players.find((player) => player.sv_id === activity.sv_id);
		if (!found) {
			FiveMActivityModel.finish(activity._id);
		}
	}
	// syncServerInfo(server, fiveM_server.serverInfo);

	// //const hl_jobs = hl_getJobs(fiveM_server.serverInfo.vars);
	// await syncActivity(server._id, players);
	// await findDiscords(players, server._id);
	// await syncDiscordRoles(server);
	// return;
};
const createPlayer = (playerInfo, server) => {
	const identifiers = MapIdentifiers(playerInfo.identifiers);
	return { identifiers, name: playerInfo.name, server };
};
async function syncServerInfo(FiveMServer, serverInfo) {
	return FiveMServerModel.findByIdAndUpdate(
		FiveMServer._id,
		{ vars: serverInfo.vars },
		{
			new: true,
			upsert: true,
		}
	).exec();
}

const MapIdentifiers = (identifiers) => {
	let map = [];
	identifiers.forEach((id) => {
		const split = id.split(":");
		map.push(split);
	});
	return new Map(map);
};

function doLog(service, text) {
	let logTxt = `[${service}] -> ${text}`;
	console.log(logTxt);
}

module.exports = { pingFiveMServer };
