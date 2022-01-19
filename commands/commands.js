const { addCommand, setPlaceholders, getPrefix } = require('@abdevs/discord.js-utils');
const { Client, TextChannel } = require('discord.js');
const _ = require('lodash');
const { getConfig, getDistube } = require('../utils/constants');
const { parseMessage } = require('../utils/utils');
const progressBar = require("string-progressbar");
const formatDuration = require('format-duration');

module.exports = (/** @type {Client} */ client) => {

    const config = getConfig();
    const distube = getDistube();

    addCommand({
        ...config.commands.play,
        handler: async (message, args) => {
            const { guild, author, member, channel } = message;
            if (!guild || !member || !(channel instanceof TextChannel)) return;
            const queue = distube.getQueue(guild.id);
            const config = getConfig();
            if (args.length === 0) {
                if (!queue || !queue.paused) {
                    const msgObj = await parseMessage(config.messages.provideSongNameOrLink, { guild, user: author, member, bot: client.user, channel });
                    channel.send(msgObj);
                    return;
                }
                queue.resume();
                message.react('▶');
                return;
            }
            const voiceChannel = message.member.voice.channel;
            if (!voiceChannel) {
                const msgObj = await parseMessage(config.messages.userNotInVoice, { guild, user: author, member, bot: client.user, channel });
                channel.send(msgObj);
                return;
            }
            const botChannel = guild.me.voice.channel;
            if (botChannel && botChannel.id !== voiceChannel.id && botChannel.members.size > 0) {
                const msgObj = await parseMessage(config.messages.alreadyPlayingInAnotherChannel, { guild, user: author, member, bot: client.user, channel });
                channel.send(msgObj);
                return;
            }
            const permissions = voiceChannel.permissionsFor(message.client.user);
            if (!permissions.has('CONNECT') || !permissions.has('SPEAK')) {
                const msgObj = await parseMessage(config.messages.noPermissionToPlay, { guild, user: author, member, bot: client.user, channel });
                channel.send(msgObj);
                return;
            }
            const wasPlaying = queue && queue.playing;
            const linkOrSearch = args.join(' ');
            await distube.play(voiceChannel, linkOrSearch, {
                textChannel: channel,
                member,
                message,
            });
            if (wasPlaying) {
                const msgObj = await parseMessage(config.messages.songQueued, { guild, user: author, member, bot: client.user, channel });
                channel.send(msgObj);
            }
        }
    });

    addCommand({
        ...config.commands.nowPlaying,
        handler: async (message) => {
            const { guild, author, member, channel } = message;
            if (!guild || !member || !(channel instanceof TextChannel)) return;
            const voiceChannel = member.voice.channel;
            const config = getConfig();
            if (!voiceChannel) {
                const msgObj = await parseMessage(config.messages.userNotInVoice, { guild, user: author, member, bot: client.user, channel });
                channel.send(msgObj);
                return;
            }
            const botChannel = guild.me.voice.channel;
            if (!botChannel) {
                const msgObj = await parseMessage(config.messages.notPlaying, { guild, user: author, member, bot: client.user, channel });
                channel.send(msgObj);
                return;
            }
            if (botChannel.id !== voiceChannel.id) {
                const msgObj = await parseMessage(config.messages.joinSameVoiceChannel, { guild, user: author, member, bot: client.user, channel });
                channel.send(msgObj);
                return;
            }
            const queue = distube.getQueue(guild.id);
            if (!queue) {
                const msgObj = await parseMessage(config.messages.notPlaying, { guild, user: author, member, bot: client.user, channel });
                channel.send(msgObj);
                return;
            }
            const song = queue.songs[0];
            const formattedCurrentDuration = formatDuration(queue.currentTime * 1000);
            const formattedTotalDuration = formatDuration(song.duration * 1000);
            const msgObj = await parseMessage(config.messages.nowPlayingCommand, { guild, user: author, member, bot: client.user, channel, song, progressBar: progressBar.splitBar(song.duration, queue.currentTime, 17)[0], formattedCurrentDuration, formattedTotalDuration });
            channel.send(msgObj);
        }
    });

    addCommand({
        ...config.commands.skip,
        handler: async (message) => {
            const { guild, author, member, channel } = message;
            if (!guild || !member || !(channel instanceof TextChannel)) return;
            const voiceChannel = member.voice.channel;
            const config = getConfig();
            if (!voiceChannel) {
                const msgObj = await parseMessage(config.messages.userNotInVoice, { guild, user: author, member, bot: client.user, channel });
                channel.send(msgObj);
                return;
            }
            const botChannel = guild.me.voice.channel;
            if (!botChannel) {
                const msgObj = await parseMessage(config.messages.notPlaying, { guild, user: author, member, bot: client.user, channel });
                channel.send(msgObj);
                return;
            }
            if (botChannel.id !== voiceChannel.id) {
                const msgObj = await parseMessage(config.messages.joinSameVoiceChannel, { guild, user: author, member, bot: client.user, channel });
                channel.send(msgObj);
                return;
            }
            const queue = distube.getQueue(guild.id);
            if (!queue) {
                const msgObj = await parseMessage(config.messages.notPlaying, { guild, user: author, member, bot: client.user, channel });
                channel.send(msgObj);
                return;
            }
            const song = queue.songs[0];
            if (queue.songs.length === 1) {
                queue.delete();
                queue.stop();
            } else queue.skip();
            const msgObj = await parseMessage(config.messages.skipped, { guild, user: author, member, bot: client.user, channel, song });
            channel.send(msgObj);
        }
    });

    addCommand({
        ...config.commands.queue,
        handler: async (message) => {
            const { guild, author, member, channel } = message;
            if (!guild || !member || !(channel instanceof TextChannel)) return;
            const config = getConfig();
            const voiceChannel = member.voice.channel;
            if (!voiceChannel) {
                const msgObj = await parseMessage(config.messages.userNotInVoice, { guild, user: author, member, bot: client.user, channel });
                channel.send(msgObj);
                return;
            }
            const botChannel = guild.me.voice.channel;
            if (!botChannel) {
                const msgObj = await parseMessage(config.messages.notPlaying, { guild, user: author, member, bot: client.user, channel });
                channel.send(msgObj);
                return;
            }
            if (botChannel.id !== voiceChannel.id) {
                const msgObj = await parseMessage(config.messages.joinSameVoiceChannel, { guild, user: author, member, bot: client.user, channel });
                channel.send(msgObj);
                return;
            }
            const queue = distube.getQueue(guild.id);
            if (!queue) {
                const msgObj = await parseMessage(config.messages.queueEmpty, { guild, user: author, member, bot: client.user, channel });
                channel.send(msgObj);
                return;
            }
            const top20Songs = queue.songs.filter((_song, i) => i <= 19);
            const description = [];
            for (let i = 0; i < top20Songs.length; i++) {
                const song = top20Songs[i];
                let format;
                if (i === 0) format = await setPlaceholders(config.messages.queueSongFormatForNowPlaying, { guild, user: author, member, bot: client.user, channel, queue, song, index: i + 1 });
                else format = await setPlaceholders(config.messages.queueSongFormat, { guild, user: author, member, bot: client.user, channel, queue, song, index: i + 1 });
                description.push(format);
            }
            if (queue.songs.length > 20)
                description.push(`and ${queue.songs.length - 20} more...`);
            const msgObj = await parseMessage(config.messages.currentQueue, { guild, user: author, member, bot: client.user, channel, queue, description: description.join('\n') });
            channel.send(msgObj);
        }
    });

    addCommand({
        ...config.commands.remove,
        handler: async (message, args) => {
            const { guild, author, member, channel } = message;
            if (!guild || !member || !(channel instanceof TextChannel)) return;
            const config = getConfig();
            const voiceChannel = member.voice.channel;
            if (!voiceChannel) {
                const msgObj = await parseMessage(config.messages.userNotInVoice, { guild, user: author, member, bot: client.user, channel });
                channel.send(msgObj);
                return;
            }
            const botChannel = guild.me.voice.channel;
            if (!botChannel) {
                const msgObj = await parseMessage(config.messages.notPlaying, { guild, user: author, member, bot: client.user, channel });
                channel.send(msgObj);
                return;
            }
            if (botChannel.id !== voiceChannel.id) {
                const msgObj = await parseMessage(config.messages.joinSameVoiceChannel, { guild, user: author, member, bot: client.user, channel });
                channel.send(msgObj);
                return;
            }
            const queue = distube.getQueue(guild.id);
            if (!queue) {
                const msgObj = await parseMessage(config.messages.notPlaying, { guild, user: author, member, bot: client.user, channel });
                channel.send(msgObj);
                return;
            }
            if (args.length === 0 || !parseInt(args[0])) {
                const msgObj = await parseMessage(config.messages.provideASongIndex, { guild, user: author, member, bot: client.user, channel });
                channel.send(msgObj);
                return;
            }
            const index = parseInt(args[0]);
            if (index < 1 || index > queue.songs.length) {
                const msgObj = await parseMessage(config.messages.songIndexTooHigh, { guild, user: author, member, bot: client.user, channel, index, count: queue.songs.length });
                channel.send(msgObj);
                return;
            }
            let song;
            if (index === 1) {
                song = queue.songs[0];
                if (queue.songs.length === 1) {
                    queue.delete();
                    queue.stop();
                } else queue.skip();
            } else {
                const [deletedSong] = queue.songs.splice(index - 1, 1);
                song = deletedSong;
            }
            const msgObj = await parseMessage(config.messages.removedSong, { guild, user: author, member, bot: client.user, channel, song, index });
            channel.send(msgObj);
        }
    });

    addCommand({
        ...config.commands.pause,
        handler: async (message) => {
            const { guild, author, member, channel } = message;
            if (!guild || !member || !(channel instanceof TextChannel)) return;
            const config = getConfig();
            const voiceChannel = member.voice.channel;
            if (!voiceChannel) {
                const msgObj = await parseMessage(config.messages.userNotInVoice, { guild, user: author, member, bot: client.user, channel });
                channel.send(msgObj);
                return;
            }
            const botChannel = guild.me.voice.channel;
            if (!botChannel) {
                const msgObj = await parseMessage(config.messages.notPlaying, { guild, user: author, member, bot: client.user, channel });
                channel.send(msgObj);
                return;
            }
            if (botChannel.id !== voiceChannel.id) {
                const msgObj = await parseMessage(config.messages.joinSameVoiceChannel, { guild, user: author, member, bot: client.user, channel });
                channel.send(msgObj);
                return;
            }
            const queue = distube.getQueue(guild.id);
            if (!queue) {
                const msgObj = await parseMessage(config.messages.notPlaying, { guild, user: author, member, bot: client.user, channel });
                channel.send(msgObj);
                return;
            }
            if (queue.paused) {
                const msgObj = await parseMessage(config.messages.alreadyPaused, { guild, user: author, member, bot: client.user, channel });
                channel.send(msgObj);
                return;
            }
            const song = queue.songs[0];
            queue.pause();
            message.react('⏸');
        }
    });


    addCommand({
        ...config.commands.resume,
        handler: async (message) => {
            const { guild, author, member, channel } = message;
            if (!guild || !member || !(channel instanceof TextChannel)) return;
            const config = getConfig();
            const voiceChannel = member.voice.channel;
            if (!voiceChannel) {
                const msgObj = await parseMessage(config.messages.userNotInVoice, { guild, user: author, member, bot: client.user, channel });
                channel.send(msgObj);
                return;
            }
            const botChannel = guild.me.voice.channel;
            if (!botChannel) {
                const msgObj = await parseMessage(config.messages.notPlaying, { guild, user: author, member, bot: client.user, channel });
                channel.send(msgObj);
                return;
            }
            if (botChannel.id !== voiceChannel.id) {
                const msgObj = await parseMessage(config.messages.joinSameVoiceChannel, { guild, user: author, member, bot: client.user, channel });
                channel.send(msgObj);
                return;
            }
            const queue = distube.getQueue(guild.id);
            if (!queue) {
                const msgObj = await parseMessage(config.messages.notPlaying, { guild, user: author, member, bot: client.user, channel });
                channel.send(msgObj);
                return;
            }
            if (!queue.paused) {
                const msgObj = await parseMessage(config.messages.alreadyPlaying, { guild, user: author, member, bot: client.user, channel });
                channel.send(msgObj);
                return;
            }
            const song = queue.songs[0];
            queue.resume();
            message.react('▶');
        }
    });

    addCommand({
        ...config.commands.clear,
        handler: async (message) => {
            const { guild, author, member, channel } = message;
            if (!guild || !member || !(channel instanceof TextChannel)) return;
            const config = getConfig();
            const voiceChannel = member.voice.channel;
            if (!voiceChannel) {
                const msgObj = await parseMessage(config.messages.userNotInVoice, { guild, user: author, member, bot: client.user, channel });
                channel.send(msgObj);
                return;
            }
            const botChannel = guild.me.voice.channel;
            if (!botChannel) {
                const msgObj = await parseMessage(config.messages.notPlaying, { guild, user: author, member, bot: client.user, channel });
                channel.send(msgObj);
                return;
            }
            if (botChannel.id !== voiceChannel.id) {
                const msgObj = await parseMessage(config.messages.joinSameVoiceChannel, { guild, user: author, member, bot: client.user, channel });
                channel.send(msgObj);
                return;
            }
            const queue = distube.getQueue(guild.id);
            if (!queue) {
                const msgObj = await parseMessage(config.messages.notPlaying, { guild, user: author, member, bot: client.user, channel });
                channel.send(msgObj);
                return;
            }
            queue.delete();
            queue.stop();
            const msgObj = await parseMessage(config.messages.queueCleared, { guild, user: author, member, bot: client.user, channel });
            channel.send(msgObj);
        }
    });

    addCommand({
        ...config.commands.disconnect,
        handler: async (message) => {
            const { guild, author, member, channel } = message;
            if (!guild || !member || !(channel instanceof TextChannel)) return;
            const config = getConfig();
            const voiceChannel = member.voice.channel;
            if (!voiceChannel) {
                const msgObj = await parseMessage(config.messages.userNotInVoice, { guild, user: author, member, bot: client.user, channel });
                channel.send(msgObj);
                return;
            }
            const botChannel = guild.me.voice.channel;
            if (!botChannel) {
                const msgObj = await parseMessage(config.messages.notPlaying, { guild, user: author, member, bot: client.user, channel });
                channel.send(msgObj);
                return;
            }
            if (botChannel.id !== voiceChannel.id) {
                const msgObj = await parseMessage(config.messages.joinSameVoiceChannel, { guild, user: author, member, bot: client.user, channel });
                channel.send(msgObj);
                return;
            }
            const queue = distube.getQueue(guild.id);
            if (!queue) {
                const msgObj = await parseMessage(config.messages.notPlaying, { guild, user: author, member, bot: client.user, channel });
                channel.send(msgObj);
                return;
            }
            queue.delete();
            queue.stop();
            guild.me.voice.disconnect();
            const msgObj = await parseMessage(config.messages.disconnected, { guild, user: author, member, bot: client.user, channel });
            channel.send(msgObj);
        }
    });

    addCommand({
        ...config.commands.help,
        handler: async (message) => {
            const { guild, author, member, channel } = message;
            if (!guild || !member || !(channel instanceof TextChannel)) return;
            const config = getConfig();
            const commands = _.map(config.commands);
            const description = [];
            for (const command of commands) {
                const format = await setPlaceholders(config.messages.helpPerCommandFormat, { guild, user: author, member, bot: client.user, channel, command, prefix: getPrefix() });
                description.push(format);
            }
            const msgObj = await parseMessage(config.messages.help, { guild, user: author, member, bot: client.user, channel, description: description.join('\n') });
            channel.send(msgObj);
        }
    });

    addCommand({
        ...config.commands.loop,
        handler: async (message) => {
            const { guild, author, member, channel } = message;
            if (!guild || !member || !(channel instanceof TextChannel)) return;
            const config = getConfig();
            const voiceChannel = member.voice.channel;
            if (!voiceChannel) {
                const msgObj = await parseMessage(config.messages.userNotInVoice, { guild, user: author, member, bot: client.user, channel });
                channel.send(msgObj);
                return;
            }
            const botChannel = guild.me.voice.channel;
            if (!botChannel) {
                const msgObj = await parseMessage(config.messages.notPlaying, { guild, user: author, member, bot: client.user, channel });
                channel.send(msgObj);
                return;
            }
            if (botChannel.id !== voiceChannel.id) {
                const msgObj = await parseMessage(config.messages.joinSameVoiceChannel, { guild, user: author, member, bot: client.user, channel });
                channel.send(msgObj);
                return;
            }
            const queue = distube.getQueue(guild.id);
            if (!queue) {
                const msgObj = await parseMessage(config.messages.notPlaying, { guild, user: author, member, bot: client.user, channel });
                channel.send(msgObj);
                return;
            }
            const mode = queue.setRepeatMode();
            const stringMode = mode === 0 ? 'disabled' : mode === 1 ? 'single song' : 'queue';
            const msgObj = await parseMessage(config.messages.loopToggle, { guild, user: author, member, bot: client.user, channel, mode: stringMode });
            channel.send(msgObj);
        }
    });

    addCommand({
        ...config.commands.shuffle,
        handler: async (message) => {
            const { guild, author, member, channel } = message;
            if (!guild || !member || !(channel instanceof TextChannel)) return;
            const config = getConfig();
            const voiceChannel = member.voice.channel;
            if (!voiceChannel) {
                const msgObj = await parseMessage(config.messages.userNotInVoice, { guild, user: author, member, bot: client.user, channel });
                channel.send(msgObj);
                return;
            }
            const botChannel = guild.me.voice.channel;
            if (!botChannel) {
                const msgObj = await parseMessage(config.messages.notPlaying, { guild, user: author, member, bot: client.user, channel });
                channel.send(msgObj);
                return;
            }
            if (botChannel.id !== voiceChannel.id) {
                const msgObj = await parseMessage(config.messages.joinSameVoiceChannel, { guild, user: author, member, bot: client.user, channel });
                channel.send(msgObj);
                return;
            }
            const queue = distube.getQueue(guild.id);
            if (!queue) {
                const msgObj = await parseMessage(config.messages.notPlaying, { guild, user: author, member, bot: client.user, channel });
                channel.send(msgObj);
                return;
            }
            queue.shuffle();
            message.react(`🔀`);
        }
    });

    addCommand({
        ...config.commands.volume,
        handler: async (message, args) => {
            const { guild, author, member, channel } = message;
            if (!guild || !member || !(channel instanceof TextChannel)) return;
            const config = getConfig();
            const voiceChannel = member.voice.channel;
            if (!voiceChannel) {
                const msgObj = await parseMessage(config.messages.userNotInVoice, { guild, user: author, member, bot: client.user, channel });
                channel.send(msgObj);
                return;
            }
            const botChannel = guild.me.voice.channel;
            if (!botChannel) {
                const msgObj = await parseMessage(config.messages.notPlaying, { guild, user: author, member, bot: client.user, channel });
                channel.send(msgObj);
                return;
            }
            if (botChannel.id !== voiceChannel.id) {
                const msgObj = await parseMessage(config.messages.joinSameVoiceChannel, { guild, user: author, member, bot: client.user, channel });
                channel.send(msgObj);
                return;
            }
            const queue = distube.getQueue(guild.id);
            if (!queue) {
                const msgObj = await parseMessage(config.messages.notPlaying, { guild, user: author, member, bot: client.user, channel });
                channel.send(msgObj);
                return;
            }
            if (args.length === 0) {
                const volume = queue.volume;
                const msgObj = await parseMessage(config.messages.volume, { guild, user: author, member, bot: client.user, channel, volume });
                channel.send(msgObj);
                return;
            }
            if (parseInt(args[0]) < 0 || parseInt(args[0]) > 100) {
                const msgObj = await parseMessage(config.messages.volumeRequired, { guild, user: author, member, bot: client.user, channel });
                channel.send(msgObj);
                return;
            }
            const volume = parseInt(args[0]);
            queue.setVolume(volume);
            const msgObj = await parseMessage(config.messages.volumeChanged, { guild, user: author, member, bot: client.user, channel, volume });
            channel.send(msgObj);
        }
    });

    addCommand({
        ...config.commands.invite,
        handler: async (message) => {
            const { guild, author, member, channel } = message;
            if (!guild || !member || !(channel instanceof TextChannel)) return;
            const config = getConfig();
            const invite = client.generateInvite({ scopes: ['bot'], permissions: ['CONNECT', 'CREATE_INSTANT_INVITE', 'EMBED_LINKS', 'REQUEST_TO_SPEAK', 'SEND_MESSAGES', 'SPEAK', 'VIEW_CHANNEL'] });
            const msgObj = await parseMessage(config.messages.invite, { guild, user: author, member, bot: client.user, channel, invite });
            channel.send(msgObj);
        }
    });
};