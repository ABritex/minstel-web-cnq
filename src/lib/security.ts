import config from '@/config'

export function createSecureResponse(body: any, init?: ResponseInit): Response {
  const headers = new Headers(init?.headers)

  // Security headers
  headers.set('X-Content-Type-Options', 'nosniff')
  headers.set('X-Frame-Options', 'DENY')
  headers.set('X-XSS-Protection', '1; mode=block')
  headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')

  // CORS
  if (config.security.corsOrigin) {
    headers.set('Access-Control-Allow-Origin', config.security.corsOrigin)
    headers.set(
      'Access-Control-Allow-Methods',
      'GET, POST, PUT, DELETE, OPTIONS',
    )
    headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    headers.set('Access-Control-Allow-Credentials', 'true')
  }

  // HSTS (only in production)
  if (config.isProduction) {
    headers.set(
      'Strict-Transport-Security',
      'max-age=31536000; includeSubDomains',
    )
  }

  // CSP
  headers.set(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self'; connect-src 'self' https://discord.com;",
  )

  return new Response(body, { ...init, headers })
}

export function createSecureJsonResponse(
  data: any,
  init?: ResponseInit,
): Response {
  const headers = new Headers(init?.headers)
  headers.set('Content-Type', 'application/json')

  return createSecureResponse(JSON.stringify(data), { ...init, headers })
}
