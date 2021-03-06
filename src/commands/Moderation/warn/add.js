const Command = require('../../../structures/Command.js');
// const util = require('util');

module.exports = class Add extends Command {
	constructor(Atlas) {
		super(Atlas, module.exports.info);
	}

	async action(msg, args, {
		settings, // eslint-disable-line no-unused-vars
	}) {
		const responder = new this.Atlas.structs.Responder(msg);

		if (!args[0]) {
			return responder.error('warn.add.noArgs').send();
		}
		const query = args.shift();
		const target = await this.Atlas.util.findMember(msg.guild, query);

		if (!target) {
			return responder.error('general.noUserFound').send();
		}

		if (args[0] && args.join(' ').length > 256) {
			return responder.error('warn.add.tooLong').send();
		}

		const warnings = settings.getWarnings(target);

		try {
			const d = await settings.addWarning({
				target: target.user || target,
				moderator: msg.author,
				reason: args.join(' '),
			});
			settings.log({
				color: this.Atlas.colors.get('orange').decimal,
				title: 'Member Warned',
				description: `${target.mention} (\`${target.tag}\`) has been warned by a ${msg.author.mention} (\`${msg.author.tag}\`).`,
				fields: [{
					name: 'Total Warnings',
					value: `${target.tag} now has ${warnings.length + 1} total warning(s).`,
					inline: true,
				}, {
					name: 'Direct Messaged',
					value: d.notified ? 'The user was direct-messaged.' : 'The user was not direct-messaged.',
					inline: true,
				}, {
					name: 'Reason',
					value: args[0] ? args.join(' ') : 'No reason specified',
					inline: true,
				}],
				timestamp: new Date(),
				footer: {
					text: `Target ${target.id} Mod ${msg.author.id}`,
				},
			}, {
				type: 'mod',
			}).catch(() => false);

			return responder
				.text(`warn.add.success.${warnings.length === 1 ? 'singular' : 'plural'}`, target.mention, warnings.length + 1)
				.send();
		} catch (e) {
			responder.error('warn.add.error').send();
		}
	}
};

module.exports.info = {
	name: 'add',
	usage: 'info.warn.add.usage',
	description: 'info.warn.add.description',
	aliases: [
		'+',
	],
	examples: [
		'@random breaking rule 3',
		'@random not playing nice',
	],
	requirements: {
		permissions: {
			user: {
				manageMessages: true,
			},
		},
	},
	guildOnly: true,
};
