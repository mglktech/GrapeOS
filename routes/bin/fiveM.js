let router = require("express").Router();
const fiveMServerModel = require("../../models/fivem/fivem-server");
const FiveMService = require("../../services/fiveM");

router.get("/server/fetch/:ip", async (req, res) => {
	const sv = new FiveMService.Server(req.params.ip);
	let json = {};
	let data = await sv
		.getInfo()
		.then((data) => res.json({ error: false, data }))
		.catch((err) => res.json({ error: true, data: err }));
});
router.get("/server/cfxFetch/:cfxCode", async (req, res) => {
	const sv = new FiveMService.Server(req.params.cfxCode);
	const data = await sv.getCfx();
	console.log(data);
});

router.get(
	// isAdmin
	"/server/get/:id/:format",
	async (req, res) => {
		let file = await fiveMServerModel.findById(req.params.id);
		let format = req.params.format;
		//console.log(file);
		if (format === "html") {
			res.render("bin/server-manager/server-info", { svData: file });
		}
		if (format === "json") {
			res.json(file);
		}
	}
);
router.get("/server/add", (req, res) => {
	res.render("bin/server-manager/server-add");
});
router.post("/server/add/", async (req, res) => {
	let ip = req.body.url;
	let svData = JSON.parse(req.body.svData);
	svData.ip = ip;
	//console.log(`ip: ${ip}`);
	//console.log(svData);
	await fiveMServerModel
		.findOneAndUpdate({ ip }, svData, {
			new: true,
			upsert: true,
		})
		.catch((err) => {
			console.log(err);
		});
	res.redirect("/bin/fiveM/server/view/all/html");
});

router.get(
	// isAdmin
	"/server/view/all/:responseType",
	async (req, res) => {
		const responseType = req.params.responseType;
		let allServers = (await fiveMServerModel.fetchAll()) || [];
		if (responseType == "html") {
			res.render("bin/server-manager/server-view", {
				servers: allServers,
			});
		}
		if (responseType == "json") {
			res.json(allServers);
		}
	}
);
module.exports = router;
