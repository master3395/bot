const Command = require('../../structures/Command.js');
const tagengine = require('./../../tagengine');

module.exports = class Evaluate extends Command {
	constructor(Atlas) {
		super(Atlas, module.exports.info);
	}

	async action(msg, args, {
		settings, // eslint-disable-line no-unused-vars
	}) {
		const responder = (new this.Atlas.structs.Responder(msg)).noDupe(false);

		if (!args[0]) {
			return responder.error('You have to include something to evaluate!').send();
		}

		const ret = await tagengine.parse(args.join(' '), {
			guild: msg.guild,
		});

		const output = ret.output || 'No variable output :c';

		if (ret.errors.length !== 0) {
			const errors = ret.errors.map(e => e.message);
			const uniq = errors
				.filter((elem, pos, arr) => arr.indexOf(elem) === pos);

			return responder.embed({
				color: this.Atlas.colors.get('red').decimal,
				title: 'Errors',
				description: `• ${uniq.join('\n• ').substring(0, 2048)}`,
				fields: [{
					name: 'Output',
					value: output.substring(0, 1024),
				}],
			})
				.send();
		}

		return responder.text(`\`\`\`${output}\`\`\``).localised(true).send();
	}
};

module.exports.info = {
	name: 'evaluate',
	description: 'Evaluate tags',
	localised: true,
	requirements: {
		permissions: {
			user: {
				administrator: true,
			},
		},
	},
};
