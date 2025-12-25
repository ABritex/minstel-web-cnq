import config from '@/config'

interface RateLimitEntry {
  count: number
  resetTime: number
}

const rateLimitMap = new Map<string, RateLimitEntry>()

export function checkRateLimit(identifier: string): {
  allowed: boolean
  resetTime?: number
} {
  const now = Date.now()
  const windowMs = config.security.rateLimit.windowMs
  const maxRequests = config.security.rateLimit.maxRequests

  const entry = rateLimitMap.get(identifier)

  if (!entry || now > entry.resetTime) {
    // First request or window expired
    rateLimitMap.set(identifier, {
      count: 1,
      resetTime: now + windowMs,
    })
    return { allowed: true }
  }

  if (entry.count >= maxRequests) {
    return { allowed: false, resetTime: entry.resetTime }
  }

  entry.count++
  return { allowed: true }
}

export function createRateLimitedResponse(resetTime: number): Response {
  return new Response(
    JSON.stringify({
      error: 'Too many requests',
      retryAfter: Math.ceil((resetTime - Date.now()) / 1000),
    }),
    {
      status: 429,
      headers: {
        'Content-Type': 'application/json',
        'Retry-After': Math.ceil((resetTime - Date.now()) / 1000).toString(),
      },
    },
  )
}
