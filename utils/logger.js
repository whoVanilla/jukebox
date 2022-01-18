const { Guild } = require('discord.js');
const chalk = require('chalk');
const { getConfig } = require('./constants');
const winston = require('winston');

const config = getConfig();
const fileLogger = winston.createLogger({ format: winston.format.simple(), transports: [new winston.transports.File({ filename: `logs/console.log` })] });

function getConsoleFormattedTime() {
    const date = new Date();
    return `[${new String(date.getHours()).padStart(2, '0')}:${new String(date.getMinutes()).padStart(2, '0')}:${new String(date.getSeconds() + 1).padStart(2, '0')}]`;
}

const timeColor = chalk.hex(config.consoleColors.time);
const infoColor = chalk.hex(config.consoleColors.info);
const warnColor = chalk.hex(config.consoleColors.warn);
const errorColor = chalk.hex(config.consoleColors.error);
/**
 * @param {string} message
 * @param {Guild} [guild]
 */
function info(message, guild) {
    if (!guild) {
        console.log(timeColor(getConsoleFormattedTime()), infoColor('[INFO]'), infoColor(message));
        fileLogger.info(`${getConsoleFormattedTime()} ${message}`);
    }
    else {
        console.log(timeColor(getConsoleFormattedTime()), infoColor('[INFO]'), infoColor(`${guild.name} - (${guild.id})`), infoColor(message));
        fileLogger.info(`${getConsoleFormattedTime()} ${guild.name} - (${guild.id}) ${message}`);
    }
}

/**
 * @param {string} message
 * @param {Guild} [guild]
 */
function error(message, guild) {
    if (!guild) {
        console.log(timeColor(getConsoleFormattedTime()), errorColor('[ERROR]'), errorColor(message));
        fileLogger.error(`${getConsoleFormattedTime()} ${message}`);
    }
    else {
        console.log(timeColor(getConsoleFormattedTime()), errorColor('[ERROR]'), errorColor(`${guild.name} - (${guild.id})`), errorColor(message));
        fileLogger.error(`${getConsoleFormattedTime()} ${guild.name} - (${guild.id}) ${message}`);
    }
}

/**
 * @param {string} message
 * @param {Guild} [guild]
 */
function warn(message, guild) {
    if (!guild) {
        console.log(timeColor(getConsoleFormattedTime()), warnColor('[WARN]'), warnColor(message));
        fileLogger.warn(`${getConsoleFormattedTime()} ${message}`);
    }
    else {
        console.log(timeColor(getConsoleFormattedTime()), warnColor('[WARN]'), warnColor(`${guild.name} - (${guild.id})`), warnColor(message));
        fileLogger.warn(`${getConsoleFormattedTime()} ${guild.name} - (${guild.id}) ${message}`);
    }
}


module.exports = { info, warn, error };