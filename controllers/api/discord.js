const client = require("../../config/api/discord");
const role_model = require("../../models/role-model");

// awaiting routing

const player_get = async (req, res) => {
	const playerID = req.playerId;
	const guildID = req.guildId;
	const member = await fetchMember(guildID, playerID);
	res.json(member);
};

const db_getRoles = (ip) => {};

const cacheRoles = (server, roles) => {
	roles.forEach((role) => {
		const newRole = new role_model({
			server,
			id: role.id,
			name: role.name,
			color: role.color,
			hoist: role.hoist,
			rawPosition: role.rawPosition,
			managed: role.managed,
			mentionable: role.mentionable,
			deleted: role.deleted,
		})
			.save()
			.catch((err) => {
				console.log(err);
			});
	});
};

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

module.exports = {
	player_get,
};
