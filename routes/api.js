const express = require("express");
const router = express.Router();
//const FiveM = require("../controllers/api/fivem.js"); // "../controllers/api/fivem"
const Db = require("../controllers/api/db.js");

//API ROOT ROUTES
//router.get("/", FiveM.index_get);
router.get("/addServer/:ip/:discordID", Db.addServer); //
router.get("/pingServer/:id", Db.fivem_get);
// FIVEM ROUTES

// WINBOX ROUTES
router.get("/winbox/hl", (req, res) => {
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
