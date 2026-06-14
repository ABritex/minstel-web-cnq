import type { VercelResponse } from '@vercel/node'

export function setSecurityHeaders(res: VercelResponse) {
    res.setHeader('X-Content-Type-Options', 'nosniff')
    res.setHeader('X-Frame-Options', 'DENY')
    res.setHeader('X-XSS-Protection', '1; mode=block')
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin')
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload')
}

export function setCorsHeaders(res: VercelResponse) {
    const origin = process.env.SERVER_URL || 'http://localhost:3000'
    res.setHeader('Access-Control-Allow-Origin', origin)
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    res.setHeader('Access-Control-Allow-Credentials', 'true')
}
