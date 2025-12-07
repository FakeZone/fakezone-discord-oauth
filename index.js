const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const DISCORD_CLIENT_ID = '1447016560559390923';
const DISCORD_CLIENT_SECRET = 'IFQ9qQKH9rmpPlZmZral4aSEBVNT_k_4';
const REDIRECT_URI = 'https://fakezone.github.io/discord-callback';

app.get('/discord/callback', async (req, res) => {
    const { code } = req.query;
    if (!code) return res.status(400).json({ error: 'No code' });

    try {
        const tokenRes = await axios.post('https://discord.com/api/oauth2/token',
            new URLSearchParams({
                client_id: DISCORD_CLIENT_ID,
                client_secret: DISCORD_CLIENT_SECRET,
                grant_type: 'authorization_code',
                code: code,
                redirect_uri: REDIRECT_URI
            }), {
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
            }
        );

        const userRes = await axios.get('https://discord.com/api/users/@me', {
            headers: { Authorization: `Bearer ${tokenRes.data.access_token}` }
        });

        const user = userRes.data;
        res.json({
            id: user.id,
            username: user.username,
            discriminator: user.discriminator,
            avatar: user.avatar 
                ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png?size=256`
                : `https://cdn.discordapp.com/embed/avatars/${parseInt(user.discriminator) % 5}.png`,
            bio: user.bio || null
        });
    } catch (error) {
        res.status(500).json({ error: 'Auth failed' });
    }
});

app.get('/', (req, res) => res.json({ status: 'OK' }));

app.listen(process.env.PORT || 3000);
