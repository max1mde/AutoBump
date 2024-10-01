const { Client } = require('discord.js-selfbot-v13')
const config = require('./config.json');
const {readFileSync} = require("fs");

const botClients = new Map();

startLoop();

async function startLoop() {
    try {
        const botsData = readFileSync('./bots.json', 'utf8');
        const bots = JSON.parse(botsData);

        for (const botName in bots) {
            if(botName === "exampleBot") continue;
            const [botToken, guildID, channelID] = bots[botName].split(':');
            let botClient = botClients.get(botToken);
            if(!botClient) {
                botClient = new Client({
                    checkUpdate: false
                });
                botClient.on('ready', async () => {
                    console.log(`${botClient.user.username} is ready!`);
                    await startCommandLoop(botClient, guildID, channelID);
                });
                await botClient.login(botToken);
                botClients.set(botToken, botClient);
                continue;
            }
            await startCommandLoop(botClient, guildID, channelID);
        }
    } catch (error) {
        console.error('Error:', error);
    }

    async function startCommandLoop(botClient, guildID, channelID) {
        const guild = botClient.guilds.cache.get(guildID);
        if (!guild) {
            console.log(`Guild with ID ${guildID} not found for ${botClient.user.username}.`);
            return;
        }

        const channel = guild.channels.cache.get(channelID);
        if (!channel) {
            console.log(`Channel with ID ${channelID} not found for ${botClient.user.username}.`);
            return;
        }

        await channel.sendSlash(config.botID, config.command);
        console.log(`${botClient.user.username} used first /${config.command} in #${channel.name} (${guild.name}).`);

        setInterval(async () => {
            try {
                await channel.sendSlash(config.botID, config.command);
                console.log(`${botClient.user.username} used after `+config.loopDelayInMinutes+` minutes /${config.command} in #${channel.name} (${guild.name}).`);
            } catch (e) {
                console.log(e);
            }
        }, config.loopDelayInMinutes * 60 * 1000);
    }
}
