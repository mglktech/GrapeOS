const Discord = require("discord.js");
const client = new Discord.Client({ _tokenType: "" });

const token = process.env.discord_token;
const guildID = process.env.guild_id;

const Server = require("../../models/server-model");
const ip = "playhigh.life:30120";
//client.login(token);
client.on("ready", () => {
	console.log(`Logged in as ${client.user.tag}!`);
	client.guilds.fetch(guildID).then((guild) => {
		findRoles(guild);
	});
});

const findRoles = async (guild) => {
	guild.roles.fetch("", true, true).then((roleManager) => {
		let c = 10;
		roleManager.cache.forEach((role) => {
			if (c > 0) {
				c--;
				//console.log(role);
			}
		});
	});
};

module.exports = client;
