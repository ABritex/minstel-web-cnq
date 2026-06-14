import { setSecurityHeaders } from '../lib/headers'
import { checkRateLimit } from '../lib/rate-limit'
import { verifyUserToken } from '../lib/jwt'
import { getEnv } from '../lib/env'
import type { VercelRequest, VercelResponse } from '@vercel/node'

const guildCache = new Map<string, { verified: boolean; expiresAt: number }>()

async function isUserInGuild(userId: string): Promise<boolean> {
    const cached = guildCache.get(userId)
    if (cached && Date.now() < cached.expiresAt) {
        return cached.verified
    }

    try {
        const env = getEnv()
        const resp = await fetch(`https://discord.com/api/guilds/${env.GUILD_ID}/members/${userId}`, {
            headers: { Authorization: `Bot ${env.BOT_TOKEN}` },
        })
        const verified = resp.ok
        guildCache.set(userId, { verified, expiresAt: Date.now() + 300_000 })
        return verified
    } catch {
        return true
    }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
    setSecurityHeaders(res)

    const ip = req.headers['x-forwarded-for']?.toString() || req.socket.remoteAddress || 'unknown'
    if (!checkRateLimit(ip)) {
        res.status(429).json({ error: 'Too many requests' })
        return
    }

    try {
        const cookies = (req.headers.cookie || '').split(';')
        const tokenCookie = cookies.find((c) => c.trim().startsWith('discord_token='))

        if (!tokenCookie) {
            res.status(401).json({ error: 'No user session' })
            return
        }

        const token = decodeURIComponent(tokenCookie.split('=')[1])
        const user = verifyUserToken(token)

        if (!user) {
            res.setHeader('Set-Cookie', 'discord_token=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0')
            res.status(401).json({ error: 'Invalid or expired session' })
            return
        }

        const inGuild = await isUserInGuild(user.id)
        if (!inGuild) {
            res.setHeader('Set-Cookie', 'discord_token=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0')
            res.status(403).json({ error: 'Not in guild' })
            return
        }

        res.json(user)
    } catch (error) {
        console.error('Error in /api/auth/me:', error)
        res.status(400).json({ error: 'Invalid session' })
    }
}
