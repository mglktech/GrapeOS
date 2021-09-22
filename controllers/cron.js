
const fiveM_svModel = require("../models/fivem/fivem-server");
const fiveMService = require("../services/fiveM");

const maxRetries = process.env.maxRetries || 3;


const syncServer = async (sv_id) => {
	const sv = await fiveM_svModel.fetchById(sv_id); // fetch server data from svModel
	if(!sv) {
		doLog("fivem-server", `Fatal Error: no match for sv_id: ${sv_id}`);
		return;
	}
    const live_sv = new fiveMService.Server(sv.ip);
    const live_svInfo = await live_sv.getInfo();
    const live_svPlayers = await live_sv.getPlayers();
	// syncServerInfo(server, fiveM_server.serverInfo);
	// const players = await syncPlayerInfo(server, fiveM_server.playerInfo);
	// //const hl_jobs = hl_getJobs(fiveM_server.serverInfo.vars);
	// await syncActivity(server._id, players);
	// await findDiscords(players, server._id);
	// await syncDiscordRoles(server);
	// return;
};

function doLog(service,text) {
	let logTxt = `[${service}] -> ${text}`;
	console.log(logTxt);
}
