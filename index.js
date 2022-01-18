const { Client } = require('discord.js');
require('dotenv').config();
const client = new Client({
    intents: [
        'GUILDS',
        'GUILD_MEMBERS',
        'GUILD_MESSAGES',
        'GUILD_VOICE_STATES'
    ],
    partials: ['CHANNEL']
});
const { init } = require('@abdevs/discord.js-utils');
const { getConfig, setDistube } = require('./utils/constants');
const ConsoleManager = require('@abdevs/console-manager');
const fileExecutor = require('@abdevs/js-file-executor');
const logger = require('./utils/logger');
const { default: DisTube } = require('distube');
const { SpotifyPlugin } = require('@distube/spotify');

ConsoleManager.init({ isHelpCommand: true });

const config = getConfig();

init(client, { isCmdManager: true, isHelpCommand: false, cmdManagerOptions: { prefix: config.prefix } });

process.on('uncaughtException', handleError);
process.on('unhandledRejection', handleError);

function handleError(error) {
    logger.error(`Uncaught exception occurred: (${error?.name}) - [${error?.message}]${error.stack ? ' - Below is the full error stack trace' : ''}`);
    if (error.stack) logger.error(error.stack);
}

client.login(!config.token || config.token === 'TOKEN' ? process.env.TOKEN : config.token).then(async () => {
    client.user.setPresence({
        activities: [
            {
                name: config.activity.name,
                // @ts-ignore
                type: config.activity.type,
                url: config.activity.url
            }
        ],
        // @ts-ignore
        status: config.status
    });

    const distube = new DisTube(client, {
        searchSongs: 1,
        plugins: [new SpotifyPlugin()],
        leaveOnEmpty: false,
        leaveOnStop: false
    });
    setDistube(distube);
    fileExecutor('commands', client);
    logger.info(`Logged in as ${client.user.tag}`);
}).catch((reason) => {
    logger.error(`Failed to start the bot, Error: ${reason}`);
    process.exit(1);
});