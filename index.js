const { Client, GatewayIntentBits } = require('discord.js');
const { joinVoiceChannel } = require('@discordjs/voice');
const express = require('express');

const app = express();
const PORT = process.env.PORT || 3000;

// Botların anlık durumlarını tutacağımız nesne
const botStatuses = {};

// Tokenleri doğrudan burada tanımlıyoruz (Render hata vermez)
const tokensData = [
    { id: 1, token: "MTU2Nzk1Mzc1MTMzNDE5MTI4OA.G8CcGt.RxcjxM6h0zAfKQ-f8GxtDT6e9Rs00kxcdIxyCA" },
    { id: 2, token: "MTU2Nzk1NDA2MDgxMDkxMTkzNg.GnM0gs.ljprkqlaKgn0I3ReJWmuC5dQnJirQ3yBd34AvU" },
    { id: 3, token: "MTU2Nzk1Njg1OTE5NTc1NjYxNA.GM86sS.R4tz6gAAwEsLfHT1mfjmYRlgOggNUNavvRIJXE" },
    { id: 4, "token": "MTU2Nzk1NDI5MTc5NTMwMDM4Mg.GQAkiW.ezyDLVQb8tgZ9lNZVhwVmNWCXQ6krSnMWij0bA" },
    { id: 5, "token": "MTU2Nzk1NDQ5Mjg5NTUyNzAzMg.GZCWek.WvtLA0PFn3L683zK2oH78T3lj_JNZXXpdijQ30" },
    { id: 6, "token": "MTU2Nzk1NDcwNjg5NzA0MzQ1Ng.GDiDj1.U7ZdRtcs7VtEJT6mGFsmEnWZ53hhIIGg9ZbGcA" },
    { id: 7, "token": "MTU2Nzk1NjM3Njc3OTc1MTUxNA.GKfn-7.LyCq1Uj8zalfAdfL0y6_KYRxTa30qtiH42MeH0" },
    { id: 8, "token": "MTU2Nzk1NjYwMzY1Mzg1MzM5NQ.GVXfLr.sdrYjZ4wlrnnhmlV2fGPXT0zZSDkaSjEQ1ijPQ" },
    { id: 9, "token": "MTU2Nzk1NzA2MjAxNTY0NzkzNA.G-WTc9.V2WZHoFpJ1uHxc_ywYvDic9uhu_WRMZ-mNBHuY" }
];

tokensData.forEach((botData) => {
    const botId = botData.id;
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
                .aktif { code { color: #4ade80; } font-weight: bold; color: #4ade80; }
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
