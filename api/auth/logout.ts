import type { VercelRequest, VercelResponse } from '@vercel/node'

export default function handler(req: VercelRequest, res: VercelResponse) {
    res.setHeader('Set-Cookie', 'discord_user=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0')
    res.json({ success: true })
}
