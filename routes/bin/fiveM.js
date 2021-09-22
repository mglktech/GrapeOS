let router = require("express").Router();
const fivemServerModel = require("../../models/fivem/fivem-server");

router.get( // isAdmin
	"/server/get/:id",  async(req,res) => {
		let file = await fivemServerModel.fetchById({_id:req.params.id});
		res.json(file);
	});

router.get( // isAdmin
	"/server/view/all/:responseType",
	async (req, res) => {
		const responseType = req.params.responseType;
		let allServers = await fivemServerModel.fetchAll();
		//console.log(allShortcuts);
		if(responseType == "html") {
			res.render("bin/fiveM/server-manager/view-all", {
				servers:allServers,
			});
		}
		if(responseType == "json") {
			res.json(allServers);
		}
		});
module.exports = router;