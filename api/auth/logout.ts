import { setSecurityHeaders } from '../../lib/headers.js'
import { checkRateLimit } from '../../lib/rate-limit.js'
import type { VercelRequest, VercelResponse } from '@vercel/node'

export default function handler(req: VercelRequest, res: VercelResponse) {
    setSecurityHeaders(res)

    const ip = req.headers['x-forwarded-for']?.toString() || req.socket.remoteAddress || 'unknown'
    if (!checkRateLimit(ip)) {
        res.status(429).json({ error: 'Too many requests' })
        return
    }

    res.setHeader('Set-Cookie', 'discord_token=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0')
    res.json({ success: true })
}
