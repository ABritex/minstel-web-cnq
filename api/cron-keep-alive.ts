import type { VercelRequest, VercelResponse } from '@vercel/node'

export default async function handler(_req: VercelRequest, res: VercelResponse) {
    const botUrl = process.env.RENDER_BOT_URL

    if (!botUrl) {
        res.status(500).json({ error: 'RENDER_BOT_URL not set' })
        return
    }

    try {
        const response = await fetch(`${botUrl}/health`, {
            signal: AbortSignal.timeout(10000),
        })
        const data = await response.json()
        res.json({ pinged: botUrl, status: response.ok ? 'ok' : 'error', data })
    } catch (error) {
        console.error('Keep-alive ping failed:', error)
        res.status(200).json({ pinged: botUrl, status: 'error', error: String(error) })
    }
}
