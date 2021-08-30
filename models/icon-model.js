/*
ICON MODEL
For storing data related to the icons themselves, like the Type, src (if applicable) etc. 
*/
const mongoose = require("mongoose");
const funcs = require("../bin/funcs/mongoose-funcs");
const Schema = mongoose.Schema;
const modelName = "icon";
const mySchema = new Schema(
	{
		name: String, // short name for selection
		type: String, // type of icon eg: img, icon
		src: String, // src of img
		class: String, // class of icon
	},
	{
		timestamps: false,
	}
);

// create model based on schema
const model = mongoose.model(modelName, mySchema);

// const shortcut = {
//     text: "Underlying text of shortcut",
//     icon:"objectId of Icon",
//     newWindow: true, // Does this shortcut open in a new window?
//     winbox:{
//         title: "Login",
// 	    // modal: true,
// 	    width: "400px",
// 	    height: "400px",
// 	    x: "center",
//         url: "/api/spotify/widget",
// 	    // top: 50,
// 	    // right: 50,
// 	    // bottom: 50,
// 	    // left: 50,
//     }
// }

module.exports = model;
