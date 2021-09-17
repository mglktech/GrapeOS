const icons = require("../models/icon-model");
const shortcuts = require("../models/shortcut-model");
const users = require("../models/user-model");
const files = require("../models/file-model");
const folders = require("../models/folder-model");

module.exports.setup = async () => {
	await users.setup();
	await files.setup();
	//console.log(adminFiles);
	//console.log(await files.getFileById("61449a59e96bf626089695d9"));
};
