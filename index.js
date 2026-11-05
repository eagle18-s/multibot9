const { Client, GatewayIntentBits } = require('discord.js');
const { joinVoiceChannel } = require('@discordjs/voice');
const express = require('express');

const app = express();
const PORT = process.env.PORT || 3000;

const botStatuses = {};

// Tokenleri Render Environment Variables (gizli değişkenler) üzerinden alıyoruz
const tokensData = [
    { id: 1, token: process.env.BOT_TOKEN_1 },
    { id: 2, token: process.env.BOT_TOKEN_2 },
    { id: 3, token: process.env.BOT_TOKEN_3 },
    { id: 4, token: process.env.BOT_TOKEN_4 },
    { id: 5, token: process.env.BOT_TOKEN_5 },
    { id: 6, token: process.env.BOT_TOKEN_6 },
    { id: 7, token: process.env.BOT_TOKEN_7 },
    { id: 8, token: process.env.BOT_TOKEN_8 },
    { id: 9, token: process.env.BOT_TOKEN_9 }
];

tokensData.forEach((botData) => {
    const botId = botData.id;
    if (!botData.token) {
        console.log(`[UYARI] Bot ${botId} için token bulunamadı!`);
        botStatuses[botId] = { status: "Hata (Token Yok)", server: "Yok", channel: "Yok", tag: `Bot ${botId}` };
        return;
    }

    botStatuses[botId] = { status: "Çevrimdışı", server: "Yok", channel: "Yok", tag: `Bot ${botId}` };

    const client = new Client({
        intents: [
            GatewayIntentBits.Guilds,
            GatewayIntentBits.GuildVoiceStates,
            GatewayIntentBits.GuildMessages,
            GatewayIntentBits.MessageContent
        ]
    });

    client.once('ready', () => {
        botStatuses[botId].status = "Aktif";
        botStatuses[botId].tag = client.user.tag;
        console.log(`[BAŞARILI] Bot ${botId} aktif: ${client.user.tag}`);
    });

    client.on('messageCreate', async message => {
        if (message.author.bot) return;

        if (message.content === '!qoşul') {
            const voiceChannel = message.member?.voice.channel;
            if (!voiceChannel) {
                if (botId === 1) message.reply("Öncə bir səs kanalına qoşulmalısan!");
                return;
            }

            const delay = (botId - 1) * 1500;

            setTimeout(async () => {
                try {
                    joinVoiceChannel({
                        channelId: voiceChannel.id,
                        guildId: voiceChannel.guild.id,
                        adapterCreator: voiceChannel.guild.voiceAdapterCreator,
                    });

                    botStatuses[botId].server = `${voiceChannel.guild.name} (${voiceChannel.guild.id})`;
                    botStatuses[botId].channel = `${voiceChannel.name} (${voiceChannel.id})`;

                    await message.channel.send(`qoşuldum (Bot ID: ${botId})`);
                } catch (err) {
                    console.error(`Bot ${botId} ses kanalına katılamadı:`, err);
                }
            }, delay);
        }
    });

    client.login(botData.token).catch(err => {
        botStatuses[botId].status = "Hata (Token Yanlış)";
        console.error(`[HATA] Bot ${botId} giriş yapamadı:`, err.message);
    });
});

app.get('/', (req, res) => {
    let html = `
    <html>
        <head>
            <title>Multi-Bot Durum Paneli</title>
            <meta charset="UTF-8">
            <style>
                body { font-family: Arial, sans-serif; background: #0f172a; color: #f8fafc; padding: 20px; }
                h1 { text-align: center; color: #38bdf8; }
                table { width: 100%; border-collapse: collapse; margin-top: 20px; background: #1e293b; border-radius: 8px; overflow: hidden; }
                th, td { padding: 12px 15px; text-align: left; border-bottom: 1px solid #334155; }
                th { background: #0284c7; color: white; }
                .aktif { color: #4ade80; font-weight: bold; }
                .hata { color: #f87171; font-weight: bold; }
            </style>
        </head>
        <body>
            <h1>🤖 Discord Multi-Bot Yönetim Paneli</h1>
            <table>
                <tr>
                    <th>Bot ID / Etiket</th>
                    <th>Durum</th>
                    <th>Sunucu (Server)</th>
                    <th>Ses Kanalı</th>
                </tr>`;

    for (const [id, data] of Object.entries(botStatuses)) {
        html += `<tr>
            <td><b>Bot #${id}</b><br><small>${data.tag}</small></td>
            <td class="${data.status === 'Aktif' ? 'aktif' : 'hata'}">${data.status}</td>
            <td>${data.server}</td>
            <td>${data.channel}</td>
        </tr>`;
    }

    html += `</table></body></html>`;
    res.send(html);
});

app.listen(PORT, () => {
    console.log(`Web Paneli ${PORT} portunda çalışıyor.`);
});
        
