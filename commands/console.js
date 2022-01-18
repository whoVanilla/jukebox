const { addCommand } = require('@abdevs/console-manager');
const { fetchGuild, fetchChannel } = require('@abdevs/discord.js-utils');
const { Client } = require('discord.js');
const { getConfig, reloadConfig, getDistube } = require('../utils/constants');
const logger = require('../utils/logger');
const { parseMessage } = require('../utils/utils');

module.exports = (/** @type {Client} */ client) => {

    const config = getConfig();
    const distube = getDistube();

    addCommand({
        ...config.consoleCommands.stop,
        handler: async () => {
            const stopChannel = await fetchChannel(config.stopMessageChannelId);
            if (stopChannel) {
                const msgObj = await parseMessage(config.messages.onStop, { client, channel: stopChannel });
                await stopChannel.send(msgObj);
            }
            logger.info(`Bot shutting down!`);
            process.exit(0);
        }
    });

    addCommand({
        ...config.consoleCommands.reload,
        handler: async () => {
            logger.info(`Reloading config...`);
            reloadConfig();
            logger.info(`Config reloaded.`);
        },
    });

    addCommand({
        ...config.consoleCommands.guilds,
        handler: async (args) => {
            const config = getConfig();
            const guilds = [...client.guilds.cache.values()];
            const pageNumber = parseInt(args[0]) ? parseInt(args[0]) : 1;
            const guildsPerPage = config.consoleCommands.guilds.guildsPerPage;
            const guildsCount = guilds.length;
            if (guildsCount === 0) {
                logger.info(`There are no guilds to list.`);
                return;
            }
            const pagesCount = Math.ceil(guildsCount / guildsPerPage);
            if (pageNumber > pagesCount) {
                logger.error(`Page number ${pageNumber} is out of range.`);
                return;
            }
            const guildsToDisplay = [...guilds].slice((pageNumber - 1) * guildsPerPage, pageNumber * guildsPerPage);
            guildsToDisplay.forEach(guild => {
                logger.info(`${guild.name} (${guild.id})`);
            });
            logger.info(`Total Guilds: ${guildsCount} - Page ${pageNumber}/${pagesCount}`);
        }
    });

    addCommand({
        ...config.consoleCommands.leave,
        handler: async (args) => {
            if (args.length === 0) {
                logger.error(`Please specify a guild id.`);
                return;
            }
            const guildId = args[0];
            const guild = await fetchGuild(guildId);
            if (!guild) {
                logger.error(`Guild with id ${guildId} not found.`);
                return;
            }
            await guild.leave();
            logger.info(`Left guild ${guild.name} (${guild.id}).`);
        },
    });

    addCommand({
        ...config.consoleCommands.nowplaying,
        handler: async (args) => {
            const queues = [...distube.queues.collection.values()];
            if (queues.length === 0) {
                logger.info(`The bot is not playing music in any guild.`);
                return;
            }
            const guildsPerPage = config.consoleCommands.nowplaying.guildsPerPage;
            const pageNumber = parseInt(args[0]) ? parseInt(args[0]) : 1;
            const guildsCount = queues.length;
            const pagesCount = Math.ceil(guildsCount / guildsPerPage);
            if (pageNumber > pagesCount) {
                logger.error(`Page number ${pageNumber} is out of range.`);
                return;
            }
            const queuesToDisplay = [...queues].slice((pageNumber - 1) * guildsPerPage, pageNumber * guildsPerPage);
            queuesToDisplay.forEach(queue => {
                const guild = queue.voiceChannel.guild;
                const nowPlaying = queue.songs[0];
                logger.info(`${guild.name} (${guild.id}) - Playing "${nowPlaying.name}" - ${nowPlaying.url}`);
            });
            logger.info(`Total Guilds: ${guildsCount} - Page ${pageNumber}/${pagesCount}`);
        }
    });
};