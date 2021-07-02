const Discord = require("discord.js");
const client = new Discord.Client({ _tokenType: "" });
const token = process.env.discord_token;
const guildID = process.env.guild_id;
const logger = require("emberdyn-logger");

client.login(token);
client.on("ready", async () => {
	logger.access(`[DISCORD]: Logged in as ${client.user.tag}!`);
	//const test = await fetchMember(guildID, "252894159713730560");
	//const test = await fetchRoles(guildID);
	//console.log(test);
});
const fetchMember = async (guildID, playerID) => {
	const guild = await client.guilds.fetch(guildID);
	return await guild.members
		.fetch(playerID)
		.then((member) => {
			return member;
		})
		.catch((err) => {
			console.log(`ERROR!: ${err}`);
			return null;
		});
};

const fetchRoles = async (guild_id) => {
	const guild = await DiscordClient.guilds.fetch(guild_id);
	return guild.roles.fetch("", true, true).then((roleManager) => {
		let c = 10;
		let roles = [];
		roleManager.cache.forEach((role) => {
			if (c > 0) {
				c--;
				roles.push(role);
			}
		});
		return roles;
		//console.log("Roles:");
		//console.log(roles);
	});
};

module.exports = client;
