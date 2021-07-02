const serverModel = require("../../models/server-model");
const playerModel = require("../../models/player-model");
const activityModel = require("../../models/activity-model");

const getPlayers = (req, res) => {
	const server = req.params.id;
	activityModel
		.find({ server, currentlyOnline: true }, { _id: 0, player: 1, onlineAt: 1 })
		.populate("player")
		.then((results) => {
			let pastedArray = [];
			results.forEach((result) => {
				let player = {
					name: result.player.name,
					discord: Object.fromEntries(result.player.identifiers).discord,
					since: result.onlineAt,
				};
				pastedArray.push(player);
			});
			//console.log(results);
			res.json(pastedArray);
		})
		.catch((error) => {
			console.log(`ERROR: /fivem/${server}/players threw an error:`);
			console.log(error);
			res.sendStatus(404);
		});
};

module.exports = { getPlayers };
