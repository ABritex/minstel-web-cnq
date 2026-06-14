import { setSecurityHeaders } from '../lib/headers'
import { getEnv } from '../lib/env'
import { checkRateLimit } from '../lib/rate-limit'
import type { VercelRequest, VercelResponse } from '@vercel/node'

export default function handler(req: VercelRequest, res: VercelResponse) {
    setSecurityHeaders(res)

    const ip = req.headers['x-forwarded-for']?.toString() || req.socket.remoteAddress || 'unknown'
    if (!checkRateLimit(ip)) {
        res.status(429).json({ error: 'Too many requests' })
        return
    }

    const env = getEnv()
    const redirectUri = `${env.SERVER_URL}/api/auth/discord/callback`
    const scope = 'identify guilds'
    const url = `https://discord.com/api/oauth2/authorize?client_id=${env.DISCORD_CLIENT_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${encodeURIComponent(scope)}`

    res.redirect(302, url)
}
