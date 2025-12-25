import { createFileRoute } from '@tanstack/react-router'
import { env } from '@/env'
import { createSecureResponse } from '@/lib/security'
import { checkRateLimit, createRateLimitedResponse } from '@/lib/rateLimit'

export const Route = createFileRoute('/api/auth/discord')({
  server: {
    handlers: {
      GET: ({ request }) => {
        const clientIP =
          request.headers.get('x-forwarded-for') ||
          request.headers.get('cf-connecting-ip') ||
          'unknown'
        const rateLimit = checkRateLimit(`discord_auth_${clientIP}`)

        if (!rateLimit.allowed) {
          return createRateLimitedResponse(rateLimit.resetTime!)
        }

        const clientId = env.DISCORD_CLIENT_ID
        const redirectUri = `${env.SERVER_URL}/api/auth/discord/callback`
        const scope = 'identify guilds'
        const discordAuthUrl = `https://discord.com/api/oauth2/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${encodeURIComponent(scope)}`
        return createSecureResponse(null, {
          status: 302,
          headers: {
            Location: discordAuthUrl,
          },
        })
      },
    },
  },
})
