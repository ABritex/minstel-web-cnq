import type { VercelRequest, VercelResponse } from '@vercel/node'

export default async function handler(_req: VercelRequest, res: VercelResponse) {
    try {
        const { neon } = await import('@neondatabase/serverless')
        const sql = neon(process.env.DATABASE_URL!)

        const rows = await sql`
            SELECT id, server_id, channel_id, message_id, user_id, url, platform
            FROM songs
            ORDER BY id DESC
            LIMIT 100
        `

        const userIds = [...new Set(rows.map((r: any) => r.user_id))]
        const usersMap: Record<string, any> = {}
        const botToken = process.env.BOT_TOKEN!

        await Promise.all(userIds.map(async (uid: string) => {
            try {
                const resp = await fetch(`https://discord.com/api/users/${uid}`, {
                    headers: { Authorization: `Bot ${botToken}` },
                })
                if (resp.ok) {
                    const u = await resp.json()
                    usersMap[uid] = { id: u.id, username: u.username, avatar: u.avatar }
                }
            } catch { }
        }))

        const songs = rows.map((r: any) => ({
            id: r.id,
            serverId: r.server_id,
            channelId: r.channel_id,
            messageId: r.message_id,
            userId: r.user_id,
            url: r.url,
            platform: r.platform,
            user: usersMap[r.user_id] || null,
        }))

        res.setHeader('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300')
        res.json(songs)
    } catch (error) {
        console.error('Error fetching songs:', error)
        res.status(500).json({ error: 'Failed to fetch songs' })
    }
}
