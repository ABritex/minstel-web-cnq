import { setSecurityHeaders } from '../../lib/headers'
import { getEnv } from '../../lib/env'
import { checkRateLimit } from '../../lib/rate-limit'
import { signUserToken } from '../../lib/jwt'
import type { VercelRequest, VercelResponse } from '@vercel/node'

export default async function handler(req: VercelRequest, res: VercelResponse) {
    setSecurityHeaders(res)

    const ip = req.headers['x-forwarded-for']?.toString() || req.socket.remoteAddress || 'unknown'
    if (!checkRateLimit(ip)) {
        res.status(429).json({ error: 'Too many requests' })
        return
    }

    const { code, error: oauthError } = req.query

    if (oauthError) {
        res.redirect(302, '/login?error=' + encodeURIComponent(String(oauthError)))
        return
    }

    if (!code || typeof code !== 'string') {
        res.redirect(302, '/login?error=no_code')
        return
    }

    try {
        const env = getEnv()

        const tokenRes = await fetch('https://discord.com/api/oauth2/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
                client_id: env.DISCORD_CLIENT_ID,
                client_secret: env.DISCORD_CLIENT_SECRET,
                grant_type: 'authorization_code',
                code,
                redirect_uri: `${env.SERVER_URL}/api/auth/discord/callback`,
            }),
        })

        if (!tokenRes.ok) throw new Error('Failed to get access token')

        const tokenData = await tokenRes.json()
        const accessToken = tokenData.access_token

        const [userRes, guildsRes] = await Promise.all([
            fetch('https://discord.com/api/users/@me', {
                headers: { Authorization: `Bearer ${accessToken}` },
            }),
            fetch('https://discord.com/api/users/@me/guilds', {
                headers: { Authorization: `Bearer ${accessToken}` },
            }),
        ])

        if (!userRes.ok) throw new Error('Failed to get user info')
        if (!guildsRes.ok) throw new Error('Failed to get guilds')

        const user = await userRes.json()
        const guilds = await guildsRes.json()

        const isInGuild = guilds.some((g: any) => g.id === env.GUILD_ID)

        if (!isInGuild) {
            res.redirect(302, '/login?error=not_in_guild')
            return
        }

        const token = signUserToken({
            id: user.id,
            username: user.username,
            avatar: user.avatar || '',
        })

        res.setHeader('Set-Cookie', `discord_token=${token}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=86400`)
        res.redirect(302, '/login?verified=true')
    } catch (err) {
        console.error('Discord OAuth error:', err)
        res.redirect(302, '/login?error=server_error')
    }
}
