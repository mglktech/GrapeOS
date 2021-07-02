const Discord = require("discord.js");
const client = new Discord.Client({ _tokenType: "" });

const token = process.env.discord_token;
const guildID = process.env.guild_id;

//client.login(token);
client.on("ready", async () => {
	console.log(`Logged in as ${client.user.tag}!`);
	//const test = await fetchPlayer(guildID, "252894159713730560");
	//const test = await fetchRoles(guildID);
	//console.log(test);
});

module.exports = client;
