const express = require("express");
const router = express.Router();
const db = require("../config/db");
const api = require("../controllers/api");

const use = (fn) => (req, res, next) => {
	Promise.resolve(fn(req, res, next)).catch(next);
};

router.get(
	"/serverStatus/:vUrlCode",
	use(async (req, res) => {
		let sv_info = await db.getServerByVUrl(req.params.vUrlCode);
		res.render("apps/server-status/server-status", { sv_info });
	})
);
router.get(
	"/serverStatus/:vUrlCode/info",
	use(async (req, res) => {
		let sv_info = await db.getServerByVUrl(req.params.vUrlCode);
		// deliver as Information window
	})
);
router.get(
	"/serverStatus/:vUrlCode/search",
	use(async (req, res) => {
		let sv_info = await db.getServerByVUrl(req.params.vUrlCode);
		// deliver as searchable content window
	})
);

router.get(
	"/serverStatus/players/:id/info",
	use(async (req, res) => {
		let collectedData = await api.getPlayerInfo(req.params.id);
		let data = {
			referer: req.headers.referer,
			playerData: collectedData.plyD,
			activityData: collectedData.recs,
			svData: collectedData.svData,
		};
		res.render("apps/server-status/player-info", data);
	})
);

router.get(
	"/spotify/widget",
	use(async (req, res) => {
		res.render("apps/spotify");
	})
);

router.get("/folder", (req, res) => {
	res.render("apps/folder");
});

module.exports = router;
