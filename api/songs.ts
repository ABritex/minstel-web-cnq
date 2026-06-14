import { setSecurityHeaders } from './lib/headers'
import { checkRateLimit } from './lib/rate-limit'
import { verifyUserToken } from './lib/jwt'
import { getEnv } from './lib/env'
import type { VercelRequest, VercelResponse } from '@vercel/node'

function extractYouTubeId(url: string): string | null {
    const patterns = [
        /(?:youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})/,
        /(?:youtu\.be\/)([a-zA-Z0-9_-]{11})/,
        /(?:youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
        /(?:youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
    ]
    for (const pattern of patterns) {
        const match = url.match(pattern)
        if (match) return match[1]
    }
    return null
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
    setSecurityHeaders(res)

    const ip = req.headers['x-forwarded-for']?.toString() || req.socket.remoteAddress || 'unknown'
    if (!checkRateLimit(ip, 60)) {
        res.status(429).json({ error: 'Too many requests' })
        return
    }

    const cookies = (req.headers.cookie || '').split(';')
    const tokenCookie = cookies.find((c) => c.trim().startsWith('discord_token='))

    if (!tokenCookie) {
        res.status(401).json({ error: 'Unauthorized' })
        return
    }

    const token = decodeURIComponent(tokenCookie.split('=')[1])
    const user = verifyUserToken(token)

    if (!user) {
        res.status(401).json({ error: 'Invalid session' })
        return
    }

    try {
        const env = getEnv()
        const { neon } = await import('@neondatabase/serverless')
        const sql = neon(env.DATABASE_URL)

        const rows = await sql`
            SELECT id, server_id, channel_id, message_id, user_id, url, platform
            FROM songs
            ORDER BY id DESC
            LIMIT 100
        `

        const userIds = [...new Set(rows.map((r: any) => r.user_id))]
        const usersMap: Record<string, any> = {}

        await Promise.all(userIds.map(async (uid: string) => {
            try {
                const resp = await fetch(`https://discord.com/api/users/${uid}`, {
                    headers: { Authorization: `Bot ${env.BOT_TOKEN}` },
                })
                if (resp.ok) {
                    const u = await resp.json()
                    usersMap[uid] = { id: u.id, username: u.username, avatar: u.avatar }
                }
            } catch { }
        }))

        const songs = rows.map((r: any) => {
            const videoId = extractYouTubeId(r.url)
            return {
                id: r.id,
                serverId: r.server_id,
                channelId: r.channel_id,
                messageId: r.message_id,
                userId: r.user_id,
                url: r.url,
                platform: r.platform,
                videoId,
                user: usersMap[r.user_id] || null,
            }
        })

        res.setHeader('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300')
        res.json(songs)
    } catch (error) {
        console.error('Error fetching songs:', error)
        res.status(500).json({ error: 'Failed to fetch songs' })
    }
}
