const Discord = require("discord.js");
const {
    Client,
    Intents
} = require('discord.js');
const {
    MessageActionRow,
    MessageButton
} = require('discord.js');
const ms = require('ms')
const client = new Client({
    intents: [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_MESSAGES,
    ],
});
const prefix = "!";
const db = require('quick.db')
const moment = require('moment')
const fs = require('fs')

client.once("ready", async () => {
    console.log(`Ready As: ${client.user.id}`);
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isButton()) return;
    if (interaction.customId === 'giveaway') {

        const enteredUsers = db.get('entered_users') || [];

        if (enteredUsers.includes(interaction.user.id)) {
            return interaction.reply({
                content: 'You have already entered this giveaway!',
                ephemeral: true
            });
        }
        await interaction.deferUpdate();

        count++;
        enteredUsers.push(interaction.user.id);

        db.set('entered_users', enteredUsers);

        let startGiveawayEmbed = {
            title: `${prizee}`,
            description: `Ends in: <t:${Math.floor(time / 1000)}:R> (<t:${Math.floor(time / 1000)}:f>)\nHosted By: **${hosted}**\nEntries: **${count}**\nWinners: **1**`,
            color: '#5865f2',
            timestamp: Date.now() + ms(timeFooter),
        };

        await interaction.message.edit({
            embeds: [startGiveawayEmbed]
        });


    }
});


client.on('messageCreate', async (message) => {
    if (message.content.startsWith(prefix + "giveaway")) {
        const args = message.content
            .slice(prefix.length)
            .trim()
            .split(/ +/);
        let duration = args[1];
        let winnerCount = args[2];

        if (!duration)
            return message.channel.send('Please provide a duration for the giveaway!\nThe abbreviations for units of time are: `d (days), h (hours), m (minutes), s (seconds)`');
        if (
            !args[1].endsWith("d") &&
            !args[1].endsWith("h") &&
            !args[1].endsWith("m") &&
            !args[1].endsWith("s")
        )
            return message.channel.send('Please provide a duration for the giveaway!\nThe abbreviations for units of time are: `d (days), h (hours), m (minutes), s (seconds)`');

        if (!winnerCount) return message.channel.send('Please provide the number of winners for the giveaway! E.g. `@role`');

        if (!args[2])
            return message.channel.send('Please provide the number of winners for the giveaway! E.g. `@role`');

        let giveawayChannel = message.mentions.channels.first();
        if (!giveawayChannel || !args[3]) return message.channel.send("Please provide a valid channel to start the giveaway!");

        let prize = args.slice(4).join(" ");
        if (!prize) return message.channel.send('Please provide a prize to start the giveaway!');
        count = 0
        const endTime = Date.now() + ms(duration);
        db.delete(`entered_users`)
        let startGiveawayEmbed = {
            title: `${prize}`,
            description: `Ends in: <t:${Math.floor(endTime / 1000)}:R> (<t:${Math.floor(endTime / 1000)}:f>)\nHosted By: **${message.author}**\nEntries: **${count}**\nWinners: **1**`,
            color: '#5865f2',
            timestamp: Date.now() + ms(args[1]),
        };
        const row = new MessageActionRow()
            .addComponents(
                new MessageButton()
                .setCustomId('giveaway')
                .setLabel('🎉')
                .setStyle('PRIMARY')
            );
        let embedGiveawayHandle = await giveawayChannel.send({
            embeds: [startGiveawayEmbed],
            components: [row]
        });
        time = endTime
        timeFooter = duration
        prizee = prize
        hosted = message.author
        setTimeout(() => {
            const endedEmbedGiveaway = {
                title: prize,
                description: `Ended: <t:${Math.floor(endTime / 1000)}:R> (<t:${Math.floor(endTime / 1000)}:f>)\nHosted By: **${message.author}**\nEntries: **${count}**\nWinner: **${winnerCount}**`,
                color: '#2f3136',
                timestamp: Date.now() + ms(args[1]),
                footer: {
                    text: "Giveaway ended"
                },
            };

            const roww = new MessageActionRow()
                .addComponents(
                    new MessageButton()
                    .setStyle('LINK')
                    .setLabel('Giveaway Summary')
                    .setURL('https://discord.com/channels/1147191408176935013/1147191408734781512')
                );

            embedGiveawayHandle.edit({
                embeds: [endedEmbedGiveaway],
                components: [roww]
            });
            const congratsEmbedGiveaway = {
                description: `🥳 Congratulations to everyone with the role <@&${args[2]}>! You just won **${prize}**!`,
                color: '#2f3136',
            };

            giveawayChannel.send(`Congratulations ${args[2]}! You won the **${prize}**!`).catch(console.error);
            db.delete(`entered_users`)
        }, ms(args[1]));
    }
});


const process = require('process')
client.login(process.env.token)

process.on('multipleResolves', (type, promise, reason) => { // Needed
    console.log('[antiCrash] :: [multipleResolves]');
    console.log(type, promise, reason);
});
process.on('unhandledRejection', (reason, promise) => { // Needed
    console.log('[antiCrash] :: [unhandledRejection]');
    console.log(promise, reason);
});
process.on("uncaughtException", (err, origin) => { // Needed
    console.log('[antiCrash] :: [uncaughtException]');
    console.log(err, origin);
});
process.on('uncaughtExceptionMonitor', (err, origin) => { // Needed
    console.log('[antiCrash] :: [uncaughtExceptionMonitor]');
    console.log(err, origin);
});
