const express = require("express");
const router = express.Router();
const apiController = require("../controllers/api");

router.get("/", apiController.index_get);
router.get("/fivem", apiController.fivem_get);
router.get("/fivem/online", apiController.fivem_getOnline);
router.get("/fivem/players", apiController.fivem_getPlayersAll);
router.get("/fivem/player-count", apiController.fivem_getPlayerCount);
router.get("/winbox/hl", (req, res) => {
	res.render("pages/hl-status");
});
router.get("/discord", (req, res) => {});
module.exports = router;
