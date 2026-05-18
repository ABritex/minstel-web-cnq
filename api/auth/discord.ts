import type { VercelRequest, VercelResponse } from '@vercel/node'

export default function handler(req: VercelRequest, res: VercelResponse) {
    const clientId = process.env.DISCORD_CLIENT_ID!
    const serverUrl = process.env.SERVER_URL!
    const redirectUri = `${serverUrl}/api/auth/discord/callback`
    const scope = 'identify guilds'
    const url = `https://discord.com/api/oauth2/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${encodeURIComponent(scope)}`

    res.redirect(302, url)
}
