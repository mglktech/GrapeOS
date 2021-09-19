const mongoose = require("mongoose");
const funcs = require("../bin/funcs/mongoose-funcs");
const Schema = mongoose.Schema;
const modelName = "file";
const mySchema = new Schema({
	name: String,
	type: String,
	data: {
		type: Map,
		of: Object,
	},
});
const model = mongoose.model(modelName, mySchema);
///funcs///

model.setup = async () => {
	let icons = default_icons();
	for (let i = 0; i < icons.length; i++) {
		const exists = await model.exists(icons[i]);
		if (!exists) {
			await new model(icons[i]).save().then((res) => {
				console.log(`Created new default icon: ${res.name}`);
			});
		}
	}
	let default_icon = await model.findOne({ name: "_file", type: "icon" });
	let shortcuts = default_shortcuts(default_icon._id);
	shortcuts.forEach(async (shortcut) => {
		const exists = await model.exists(shortcut);
		if (!exists) {
			let push = await new model(shortcut).save();
			console.log(`Created new default shortcut: ${push.name}`);
			//console.log(push);
		}
	});
	setupDefaultFolders();
};


/// Setup Folders///
const setupDefaultFolders = async () => {
	const icon = await model.findOne({ name: "_folder", type: "icon" });
	const adminFiles = await model.find({
		type: "shortcut",
		"data.requireAdmin": true,
	});
	let adminFolder = {
		name: "Administrative Tools",
		type: "folder",
		data: {
			icon:icon._id,
			requireAuth:true,
			requireAdmin:true,
			desktopVisible: true,
			files: [],
		},
	};
	for(let file of adminFiles) {
		adminFolder.data.files.push(file._id);
	}
	const folder_exists = await model.exists({
		name: adminFolder.name,
		type: adminFolder.type,
	});
	if (!folder_exists) {
		new model(adminFolder).save().then((result) => {
			console.log(`Created new default folder: ${result.name}`);
		});
	}
};
/* Folder Data Model:
{
files: [String], <-- ObjectIDs of each file contined within the folder
}
*/

///Setup Icons///
/* Icon Data Model:
{
    iconType:String, <-- Display type, Icon or Image?
    iconTypeData:String, <-- Type Data, can be Icon Class or Image src.
}
*/
const default_icons = () => {
	return [
		{
			name: "_default",
			type: "icon",
			data: {
				iconType: "icon",
				iconTypeData: "fa fa-user",
			},
		},
		{
			name: "_folder",
			type: "icon",
			data: {
				iconType: "icon",
				iconTypeData: "fa fa-folder-open",
			},
		},
		{
			name: "_file",
			type: "icon",
			data: {
				iconType: "icon",
				iconTypeData: "fa fa-file",
			}
		}
	];
};
/*
Shortcut Data Model:
{
    icon: ObjectId,
    requireAuth: Boolean, <-- Does this shortcut require the user to be logged in to view?
    requireAdmin: Boolean, <-- Does this shortcut require the user to be a site administrator to view?
    winbox:{
        title:String,
        width:String, <-- \\ 
        height:String, <--\\\\ Strings instead of integers so I can use relative terms like viewer height/width
        url:String, <-- Each winbox is an iframe of another part of the site.
    }
}
*/
const default_shortcuts = (default_icon = null) => {
	if (!default_icon) {
		console.log(
			"[CRITICAL ERROR]: setupShortcuts was not provided a default_icon!"
		);
		return null;
	}
	return [
		{
			name: "Task Scheduler",
			type: "shortcut",
			data: {
				icon: default_icon,
				requireAuth: true,
				requireAdmin: true,
				desktopVisible: false,
				winbox: {
					title: "Task Scheduler",
					width: "400",
					height: "520",
					url: "/bin/tasks/view",
				}
				
			},
		},
		{
			name: "Icon Manager",
			type: "shortcut",
			data: {
				icon: default_icon,
				requireAuth: true,
				requireAdmin: true,
				desktopVisible: false,
				winbox: {
				title: "Icon Manager",
				width: "400",
				height: "520",
				url: "/bin/icons/view",
				},
			},
		},
		{
			name: "Shortcut Manager",
			type: "shortcut",
			data: {
				icon: default_icon,
				requireAuth: true,
				requireAdmin: true,
				desktopVisible: false,
				winbox: {
				title: "Shortcut Manager",
				width: "400",
				height: "520",
				url: "/bin/shortcuts/view",
				},
			},
		},
		{
			name: "Folder Manager",
			type: "shortcut",
			data: {
				icon: default_icon,
				requireAuth: true,
				requireAdmin: true,
				desktopVisible: false,
				winbox: {
				title: "Folder Manager",
				width: "400",
				height: "520",
				url: "/bin/folders/view",
				},
			},
		},
		{
			name: "About",
			type: "shortcut",
			data: {
				icon: default_icon,
				requireAuth: false,
				requireAdmin: false,
				desktopVisible: true,
				winbox: {
					title: "About Me",
					width: "1024",
					height: "768",
					url: "/about",
				}	
				
			},
		},
	];
};

model.getFile = async (filter) => {
	let file = await model.findOne(filter);
	if(file) {
		return file.toObject({ flattenMaps: true });
	}
	console.log(`getFile Error: No file found for filter: ${filter}`);
	return null;
};
model.getFiles = async (filter) => {
	let files = await model.find(filter);
	let rtnArray = [];
	files.forEach((file) => {
		rtnArray.push(file.toObject({ flattenMaps: true }));
	});
	return rtnArray;
};
model.removeFile = (_id) => {
	model.findByIdAndRemove(_id);
};
model.getShortcut = async (filter = {}) => {
	Object.assign(filter, {type:"shortcut"});
	let sc = await model.getFile(filter);
	sc.icon = await model.getFile({ _id: sc.data.icon });
	return sc;
};
model.getShortcuts = async (filter = {}) => {
	Object.assign(filter, {type:"shortcut"});
	let scs = await model.getFiles(filter);
	for (let i = 0; i < scs.length; i++) {
		// forEach loops don't like to behave asynchronously.
		scs[i].icon = await model.getFile({ _id: scs[i].data.icon });
	}
	//console.log(scs);
	return scs;
};
model.getFolder = async(filter) => {
	Object.assign(filter, {type:"folder"});
	let fd = await model.getFile(filter);
	fd.icon = await model.getFile({ name: "_folder",
	type: "icon", });
	return fd;
};
model.getFolders = async (filter) => {
	Object.assign(filter, {type:"folder"});
	let fds = await model.getFiles(filter);
	for (let i = 0; i < fds.length; i++) {
		// forEach loops don't like to behave asynchronously.
		fds[i].icon = await model.getFile({ name: "_folder",
		type: "icon", });
	}
	return fds;
};
model.addIcon = (data) => {
	new model({
		name: data.name,
		type: "icon",
		data: {
			iconType: data.iconType,
			iconTypeData: data.iconTypeData,
			},
	}).save();
};
model.addShortcut = (data) => {
	new model(data).save();
}
///export///
module.exports = model;
