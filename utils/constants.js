const { getConfig: getFileConfig } = require('@abdevs/discord.js-utils');
const { default: DisTube } = require('distube');

const defaultConfigObject = {
    token: 'TOKEN',
    themeColor: '#6e3dff',
    prefix: '-',
    activity: {
        name: 'Webhooks',
        type: 'LISTENING',
    },
    consoleColors: {
        time: `#918c8c`,
        info: `#00d2fc`,
        warn: `#ffb833`,
        error: `#ff0000`,
    },
    status: 'online',
    startMessageChannelId: '00000000000000000',
    stopMessageChannelId: '00000000000000000',
    commands: {
        play: {
            command: 'play',
            aliases: ['p'],
            description: 'Play a song',

        },
        nowPlaying: {
            command: 'nowplaying',
            aliases: ['np'],
            description: 'Get the current playing song',
        },
        skip: {
            command: 'skip',
            aliases: ['s'],
            description: 'Skip the current song',
        },
        queue: {
            command: 'queue',
            aliases: ['q'],
            description: 'Get the current queue',
        },
        remove: {
            command: 'remove',
            aliases: ['delete'],
            description: 'Remove a song from the queue',
        },
        pause: {
            command: 'pause',
            aliases: [],
            description: 'Pause the current song',
        },
        resume: {
            command: 'resume',
            aliases: ['r', 'continue'],
            description: 'Resume the current song',
        },
        loop: {
            command: 'loop',
            aliases: [],
            description: 'Loop the current song/queue/disable',
        },
        shuffle: {
            command: 'shuffle',
            aliases: [],
            description: 'Shuffle the current queue',
        },
        clear: {
            command: 'clear',
            aliases: ['c'],
            description: 'Clear the current queue',
        },
        disconnect: {
            command: 'disconnect',
            aliases: ['dc'],
            description: 'Disconnect from the voice channel',
        },
        help: {
            command: 'help',
            aliases: ['h'],
            description: 'Gets the command list',
        },
        volume: {
            command: 'volume',
            aliases: ['vol'],
            description: 'Change the volume of the current queue',
        },
        invite: {
            command: 'invite',
            aliases: ['inv'],
            description: 'Get the bot invite link',
        }
    },
    consoleCommands: {
        stop: {
            command: 'stop',
            description: 'Shutdown the bot',
            aliases: [],
        },
        reload: {
            command: 'reload',
            description: 'Reload the config',
            aliases: [],
        },
        guilds: {
            command: 'guilds',
            description: 'List all guilds the bot is in',
            aliases: [],
            guildsPerPage: 10,
        },
        leave: {
            command: 'leave',
            description: 'Leave the specified guild',
            aliases: []
        },
        nowplaying: {
            command: 'nowplaying',
            description: 'Guilds the bot is currently playing songs in',
            aliases: ['np'],
            guildsPerPage: 10,
        },
        invite: {
            command: 'invite',
            description: 'Get the provided guild invite link',
            aliases: ['inv'],
        }
    },
    messages: {
        onStart: {
            title: 'Bot started',
            description: 'The bot has started',
        },
        onStop: {
            title: 'Bot stopped',
            description: 'The bot has stopped',
        },
        provideSongNameOrLink: {
            description: 'Please provide a song name or link',
            color: 'RED',
        },
        notPaused: {
            description: `The queue is not paused`,
            color: 'YELLOW',
        },
        userNotInVoice: {
            description: `You have to be in a voice channel to play music!`,
            color: 'RED',
        },
        noPermissionToPlay: {
            description: `I don't have permission to play music in this channel! Make sure I have permission to \`CONNECT\` and \`SPEAK\``,
            color: 'RED',
        },
        alreadyPlayingInAnotherChannel: {
            description: `I'm already playing music in another channel!`,
            color: 'RED',
        },
        nowPlaying: {
            title: 'Now playing',
            description: '[{song_name}]({song_url})',
            thumbnail: '{song_thumbnail}',
            footer: 'Duration: {song_formattedDuration}',
            color: 'GREEN'
        },
        nowPlayingCommand: {
            title: 'Now playing',
            description: `[{song_name}]({song_url})
            
            {formattedCurrentDuration} {progressBar} {formattedTotalDuration}`,
            thumbnail: '{song_thumbnail}',
            footer: 'Duration: {song_formattedDuration}',
            color: 'GREEN'
        },
        songQueued: {
            description: `Song added to queue.`,
            color: 'GREEN',
        },
        notPlaying: {
            description: `I'm not playing music right now!`,
            color: 'RED',
        },
        error: {
            description: `An unexpected error occurred. Try changing the region of the voice channel.`,
            footer: `If it happens too frequently, dm Vanilla#6968 to report.`,
            thumbnail: `https://static.wikia.nocookie.net/minecraft_gamepedia/images/d/d5/Ghast_JE2_BE2.gif`,
            color: 'RED',
        },
        joinSameVoiceChannel: {
            description: `You need to join the same voice channel as me!`,
            color: 'RED',
        },
        skipped: {
            description: `Skipped the current song!`,
            color: 'GREEN',
        },
        queueEmpty: {
            description: `The queue is empty!`,
            color: 'RED',
        },
        queueSongFormatForNowPlaying: `**{index}: [{song_name}]({song_url})**`,
        queueSongFormat: `{index}: [{song_name}]({song_url})`,
        currentQueue: {
            title: 'Queue',
            description: `{description}`,
            thumbnail: 'https://static.wikia.nocookie.net/minecraft/images/6/63/Note_Block_animate.gif',
            footer: 'Jukebox',
            color: 'GREEN'
        },
        provideASongIndex: {
            description: `Please provide a song index to remove`,
            color: 'RED',
        },
        songIndexTooHigh: {
            description: `The song index is too high! There are only {count} songs in the queue.`,
            color: 'RED',
        },
        removedSong: {
            description: `Removed the song named [{song_name}]({song_url}).`,
            color: 'GREEN',
        },
        alreadyPaused: {
            description: `The queue is already paused!`,
            color: 'YELLOW',
        },
        alreadyPlaying: {
            description: `The queue is already playing!`,
            color: 'YELLOW',
        },
        songResumed: {
            description: `Resumed the current queue!`,
            color: 'GREEN',
        },
        loopToggle: {
            description: `Looping is now on {mode} mode.`,
            color: 'GREEN',
        },
        queueCleared: {
            description: `Cleared the current queue!`,
            color: 'GREEN',
        },
        disconnected: {
            description: `Disconnected from the voice channel and cleared the queue!`,
            color: 'GREEN',
        },
        helpPerCommandFormat: `・\`{prefix}{command_command}\`: {command_description}`,
        help: {
            title: 'Showing all the available commands',
            description: `{description}
            [Invite the bot](https://discord.com/oauth2/authorize?scope=bot+applications.commands&client_id=889793467948081152)`,
            thumbnail: `https://static.wikia.nocookie.net/minecraft/images/e/e2/RedstoneLampNew.gif`,
            footer: `Jukebox`
        },
        volume: {
            description: `Current volume is {volume}%`,
            color: 'GREEN',
        },
        volumeRequired: {
            description: `Please provide a volume between 0 and 100`,
            color: 'RED',
        },
        volumeChanged: {
            description: `Volume changed to \`{volume}\`%`,
            color: 'GREEN',
        },
        invite: {
            description: `Invite the bot to your server: [Invite Jukebox]({invite})`,
        }
    }
};

let config = getFileConfig('./config.yml', defaultConfigObject);
let gDistube;

function reloadConfig() {
    config = getFileConfig('./config.yml', defaultConfigObject);
}

function getConfig() {
    return config;
}

/**
 * @param {DisTube} distube
 */
function setDistube(distube) {
    gDistube = distube;
}

/**
 * 
 * @returns {DisTube}
 */
function getDistube() {
    return gDistube;
}

module.exports = {
    getConfig,
    reloadConfig,
    setDistube,
    getDistube,
};