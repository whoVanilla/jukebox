const { Client } = require('discord.js');
const { getDistube, getConfig } = require('../utils/constants');
const logger = require('../utils/logger');
const { parseMessage } = require('../utils/utils');

module.exports = (/** @type {Client} */ client) => {
    const distube = getDistube();

    client.on('guildCreate', guild => {
        logger.info(`Bot joined a guild ${guild.name} - (${guild.id})`, guild);
    });

    client.on('guildDelete', guild => {
        logger.info(`Bot was removed from a guild ${guild.name} - (${guild.id})`, guild);
    });

    distube.on('playSong', async (queue, song) => {
        const guild = queue.voiceChannel.guild;
        const channel = queue.textChannel;
        const config = getConfig();
        const member = song.member;
        const user = song.member.user;
        logger.info(`Playing song "${song.name}" - ${song.url} by ${user.tag} (${user.id})`, guild);
        const msgObj = await parseMessage(config.messages.nowPlaying, { guild, bot: client.user, channel, song, member, user });
        channel?.send(msgObj);
    });

    distube.on('error', async (channel, error) => {
        const guild = channel.guild;
        const config = getConfig();
        logger.error(`An error occurred: ${error.message}`, guild);
        console.log(error);
        const msgObj = await parseMessage(config.messages.error, { guild, bot: client.user, channel, error });
        channel?.send(msgObj);
    });
};