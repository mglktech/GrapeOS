const express = require("express");
const router = express.Router();
const FiveM = require("../controllers/api/fivem.js"); // "../controllers/api/fivem"
const Db = require("../controllers/api/db.js");

router.get("/", FiveM.index_get);
router.get("/fivem", FiveM.fivem_get);
//router.get("/fivem/online", FiveM.fivem_getOnline);
router.get("/fivem/players", FiveM.fivem_getPlayersAll);
//router.get("/fivem/player-count", FiveM.fivem_getPlayerCount);
router.get("/fivem/:id/players", Db.getPlayers);
router.get("/winbox/hl", (req, res) => {
	res.render("pages/hl-status");
});
router.get("/winbox/btns", (req, res) => {
	res.render("pages/btns");
});
router.get("/discord", (req, res) => {});
module.exports = router;
