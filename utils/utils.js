const { getConfig } = require('./constants');
const { setPlaceholders } = require('@abdevs/discord.js-utils');
const { MessageEmbed } = require('discord.js');
const _ = require('lodash');

/**
 * @param {any} obj
 */
function generateEmbed(obj) {
    const newObject = _.cloneDeep(obj);
    if (!newObject.color) newObject.color = getConfig().themeColor;
    if (typeof newObject.footer === 'string') newObject.footer = { text: newObject.footer };
    if (typeof newObject.author === 'string') newObject.author = { name: newObject.author };
    if (typeof newObject.thumbnail === 'string') newObject.thumbnail = { url: newObject.thumbnail };
    if (typeof newObject.image === 'string') newObject.image = { url: newObject.image };
    if (typeof newObject.timestamp === 'string') newObject.timestamp = parseInt(newObject.timestamp);
    if (newObject.description) newObject.description = newObject.description.toString().slice(0, 2048);
    return new MessageEmbed(newObject);
}

async function parseMessage(messageObj, variables) {
    if (typeof messageObj === 'string') return { content: await setPlaceholders(messageObj, variables) };
    const obj = _.cloneDeep(messageObj);
    if (Array.isArray(obj)) return { content: await setPlaceholders(obj, variables) };
    const findStringAndSetPlaceholders = async (o) => {
        for (const key of Object.keys(o)) {
            if (typeof o[key] === 'object') {
                await findStringAndSetPlaceholders(o[key]);
                continue;
            }
            if (typeof o[key] === 'string') o[key] = await setPlaceholders(o[key], variables);
        }
    };
    await findStringAndSetPlaceholders(obj);
    return { content: obj.content, embeds: [generateEmbed(obj)] };
}

module.exports = {
    parseMessage,
};