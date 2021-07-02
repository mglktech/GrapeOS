const DiscordClient = require("../../config/api/discord");
const role_model = require("../../models/role-model");

// awaiting routing

const fetchRoles = async (client, guild_id) => {
	const guild = await client.guilds.fetch(guild_id);
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

const db_getRoles = (ip) => {};

const cacheRoles = (server, roles) => {
	roles.forEach((role) => {
		const newRolw = new role_model({
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

const fetchMember = async (guild, player_id) => {
	return guild.members
		.fetch(player_id)
		.then((member) => {
			return member;
		})
		.catch((err) => {
			console.log(err);
			return null;
		});
};
