import type { VercelRequest, VercelResponse } from '@vercel/node'

export default function handler(req: VercelRequest, res: VercelResponse) {
    try {
        const cookies = (req.headers.cookie || '').split(';')
        const userCookie = cookies.find((c) => c.trim().startsWith('discord_user='))

        if (!userCookie) {
            res.status(401).json({ error: 'No user session' })
            return
        }

        const user = JSON.parse(decodeURIComponent(userCookie.split('=')[1]))
        res.json(user)
    } catch (error) {
        console.error('Error in /api/auth/me:', error)
        res.status(400).json({ error: 'Invalid session' })
    }
}
