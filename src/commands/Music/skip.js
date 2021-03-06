const Command = require('../../structures/Command.js');

module.exports = class Next extends Command {
	constructor(Atlas) {
		super(Atlas, module.exports.info);
	}

	async action(msg, {
		settings, // eslint-disable-line no-unused-vars
	}) {
		const responder = new this.Atlas.structs.Responder(msg);

		const voiceChannel = msg.guild.channels.get(msg.guild.me.voiceState.channelID);
		if (!voiceChannel) {
			return responder.error('next.noPlayer').send();
		}
		const player = await this.Atlas.client.voiceConnections.getPlayer(voiceChannel, false);
		if (!player || !player.isPlaying || !player.track) {
			return responder.error('next.noPlayer').send();
		} if (!player.queue[player.index + 1]) {
			return responder.error('next.nothingNext');
		}

		const { title } = player.track.info;
		player.stop();

		return responder.text('next.success', title).send();
	}
};

module.exports.info = {
	name: 'next',
	description: 'info.next.description',
	guildOnly: true,
	aliases: [
		'skip',
	],
};
