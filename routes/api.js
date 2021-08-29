const express = require("express");
const router = express.Router();
//const FiveM = require("../controllers/api/fivem.js"); // "../controllers/api/fivem"
const api = require("../controllers/api.js");
const model = require("../models/hl-dragtime-model");
//API ROOT ROUTES
//router.get("/", FiveM.index_get);
router.get("/addServer/:ip/:discordID", api.addServer); // // MOVE THIS TO PROTECTED ROUTES
//router.get("/pingServer/:id", api.fivem_get);
router.get("/playerInfo/:vanityUrlCode", api.db_onlinePlayers_get); // old!
// FIVEM ROUTES

// Server API Routes
router.get("/servers/:vanityUrlCode/playerInfo", api.getOnlinePlayerInfo);
router.get("/servers/:vanityUrlCode/serverInfo", api.getOnlineServerInfo);
router.get("/players/:id/info", api.getPlayerInfo);

// Bespoke Routes

router.get("/bespoke/highlife/dragtimes/", (req, res) => {
	res.render("pages/bespoke/highlife/hl-dragtimes");
});

router.get("/bespoke/highlife/dragtimes/get", async (req, res) => {
	let data = await model.get();
	res.json(data);
});
router.get(
	"/bespoke/highlife/dragtimes/sortsearch/:sort/:search",
	async (req, res) => {
		console.log(req.params.sort, req.params.search);
		let data = await model.get(req.params.sort, req.params.search);
		res.json(data);
	}
);

// LastFM Data
router.get("/lastfm", api.getUserTracks);
// WINBOX ROUTES
router.get("/winbox/hlServerStatus", (req, res) => {
	res.render("pages/hl-status");
});
router.get("/filemanager/:route", (req, res) => {
	const route = req.params.route;
	res.render("pages/file-manager", { route });
});
router.get("/winbox/btns", (req, res) => {
	res.render("pages/btns");
});
router.get("/spotify/info", async (req, res) => {
	var data = "";

	res.json(data);
});
router.get("/spotify/widget", async (req, res) => {
	res.render("pages/spotify");
});
// DISCORD API ROUTES
// router.get("/discord", discord.init);
// router.get("/discord/:guildID/get", discord.guild_get);
// router.get("/discord/:guildID/roles/:roleID", discord.role_get);
// router.get("/discord/:guildId/:playerId", discord.player_get);
module.exports = router;
