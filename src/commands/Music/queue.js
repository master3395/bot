const prettyMs = require('pretty-ms');
const Command = require('../../structures/Command.js');
const lib = require('./../../../lib');

module.exports = class Queue extends Command {
	constructor(Atlas) {
		super(Atlas, module.exports.info);
	}

	async action(msg, args, {
		settings, // eslint-disable-line no-unused-vars
	}) {
		// todo: handle channels where the bot can't embed links
		const responder = new this.Atlas.structs.Responder(msg);

		const voiceChannel = msg.guild.channels.get(msg.guild.me.voiceState.channelID);
		if (!voiceChannel) {
			return responder.error('queue.noPlayer').send();
		}
		const player = await this.Atlas.client.voiceConnections.getPlayer(voiceChannel, false);
		if (!player || !player.isPlaying) {
			return responder.error('queue.noPlayer').send();
		}

		const pageN = isNaN(args[0]) ? 1 : Number(args[0]);
		const queue = player.upcoming;
		const np = player.track;

		// fixme: this has random issues when going to certain pages
		responder.paginate({
			user: msg.author.id,
			page: pageN,
		}, (data) => {
			const page = lib.utils.paginateArray(queue, data.page.current, 8);
			// reset total pages once it's been (re)calculated
			data.page.total = page.totalPages;

			const length = [player.track, ...queue]
				.map(m => (m.info ? m.info.length : 0))
				.reduce((a, b) => a + b, 0) - player.position;

			const formatted = prettyMs(length);

			const embed = {
				fields: [],
			};

			if (np && np.info) {
				embed.fields.push({
					name: 'general.music.nowPlaying.name',
					value: ['general.music.nowPlaying.value', np.info.title, np.info.uri],
				});
			}

			embed.fields.push({
				name: 'queue.embed.totalDuration.name',
				value: ['queue.embed.totalDuration.value', formatted],
				inline: true,
			}, {
				name: 'queue.embed.inQueue.name',
				value: [
					`queue.embed.inQueue.value.${queue.length === 1
						? 'singular'
						: 'plural'}`,
					queue.length,
				],
				inline: true,
			}, {
				name: 'queue.embed.upNext.value',
				value: page.data
					.map(m => responder
						.format('queue.embed.upNext.format', m.index + 1, m.info.title, m.info.uri))
					.join('\n')
					.substring(0, 1024),
			});

			return embed;
		}).send();
	}
};

module.exports.info = {
	name: 'queue',
	usage: 'info.queue.usage',
	description: 'info.queue.description',
	guildOnly: true,
	aliases: [
		'upcoming',
		'upnext',
		'q',
	],
};
