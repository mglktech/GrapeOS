const express = require("express");
const router = express.Router();
//const FiveM = require("../controllers/api/fivem.js"); // "../controllers/api/fivem"
const api = require("../controllers/api.js");

//API ROOT ROUTES
//router.get("/", FiveM.index_get);
router.get("/addServer/:ip/:discordID", api.addServer); //
router.get("/pingServer/:id", api.fivem_get);
router.get("/playerInfo/:vanityUrlCode", api.db_onlinePlayers_get);
// FIVEM ROUTES

// WINBOX ROUTES
router.get("/winbox/hlServerStatus", (req, res) => {
	res.render("pages/hl-status");
});
router.get("/winbox/btns", (req, res) => {
	res.render("pages/btns");
});

// DISCORD API ROUTES
// router.get("/discord", discord.init);
// router.get("/discord/:guildID/get", discord.guild_get);
// router.get("/discord/:guildID/roles/:roleID", discord.role_get);
// router.get("/discord/:guildId/:playerId", discord.player_get);
module.exports = router;
