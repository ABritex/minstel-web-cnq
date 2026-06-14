const rateLimitMap = new Map<string, { count: number; resetAt: number }>()

const WINDOW_MS = 60_000

export function checkRateLimit(ip: string, maxRequests = 30): boolean {
    const now = Date.now()
    const entry = rateLimitMap.get(ip)

    if (!entry || now > entry.resetAt) {
        rateLimitMap.set(ip, { count: 1, resetAt: now + WINDOW_MS })
        return true
    }

    if (entry.count >= maxRequests) {
        return false
    }

    entry.count++
    return true
}

setInterval(() => {
    const now = Date.now()
    for (const [key, entry] of rateLimitMap) {
        if (now > entry.resetAt) {
            rateLimitMap.delete(key)
        }
    }
}, 60_000)
