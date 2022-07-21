const { Client } = require('discord.js');
require('dotenv').config();
const client = new Client({
  intents: ['GUILDS', 'GUILD_MEMBERS', 'GUILD_MESSAGES', 'GUILD_VOICE_STATES'],
  partials: ['CHANNEL'],
});
const { init, fetchChannel } = require('@abdevs/discord.js-utils');
const { getConfig, setDistube } = require('./utils/constants');
const ConsoleManager = require('@abdevs/console-manager');
const fileExecutor = require('@abdevs/js-file-executor');
const logger = require('./utils/logger');
const { default: DisTube } = require('distube');
const { SpotifyPlugin } = require('@distube/spotify');
const { parseMessage } = require('./utils/utils');
const { YtDlpPlugin } = require('@distube/yt-dlp');

ConsoleManager.init({ isHelpCommand: true });

const config = getConfig();

init(client, {
  isCmdManager: true,
  isHelpCommand: false,
  cmdManagerOptions: { prefix: config.prefix },
});

process.on('uncaughtException', handleError);
process.on('unhandledRejection', handleError);

function handleError(error) {
  logger.error(
    `Uncaught exception occurred: (${error?.name}) - [${error?.message}]${
      error.stack ? ' - Below is the full error stack trace' : ''
    }`
  );
  if (error.stack) logger.error(error.stack);
}

client
  .login(
    !config.token || config.token === 'TOKEN' ? process.env.TOKEN : config.token
  )
  .then(async () => {
    client.user.setPresence({
      activities: [
        {
          name: config.activity.name,
          // @ts-ignore
          type: config.activity.type,
          url: config.activity.url,
        },
      ],
      // @ts-ignore
      status: config.status,
    });

    const distube = new DisTube(client, {
      searchSongs: 1,
      plugins: [new YtDlpPlugin(), new SpotifyPlugin()],
      leaveOnEmpty: false,
      leaveOnStop: false,
      youtubeDL: false,
    });
    setDistube(distube);
    fileExecutor('commands', client);
    logger.info(`Logged in as ${client.user.tag}`);
    const startChannel = await fetchChannel(config.startMessageChannelId);
    if (startChannel) {
      const msgObj = await parseMessage(config.messages.onStart, {
        client,
        channel: startChannel,
      });
      startChannel.send(msgObj);
    }
  })
  .catch((reason) => {
    logger.error(`Failed to start the bot, Error: ${reason}`);
    process.exit(1);
  });
