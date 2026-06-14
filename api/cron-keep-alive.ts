import { setSecurityHeaders } from '../lib/headers.js'
import { getEnv } from '../lib/env.js'
import type { VercelRequest, VercelResponse } from '@vercel/node'

export default async function handler(_req: VercelRequest, res: VercelResponse) {
    setSecurityHeaders(res)

    const env = getEnv()

    if (!env.RENDER_BOT_URL) {
        res.status(500).json({ error: 'RENDER_BOT_URL not set' })
        return
    }

    try {
        const response = await fetch(`${env.RENDER_BOT_URL}/health`, {
            signal: AbortSignal.timeout(10000),
        })
        const data = await response.json()
        res.json({ pinged: env.RENDER_BOT_URL, status: response.ok ? 'ok' : 'error', data })
    } catch (error) {
        console.error('Keep-alive ping failed:', error)
        res.status(200).json({ pinged: env.RENDER_BOT_URL, status: 'error', error: String(error) })
    }
}
