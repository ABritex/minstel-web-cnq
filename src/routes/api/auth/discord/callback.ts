import { createFileRoute } from '@tanstack/react-router'
import { env } from '@/env'
import { createSecureResponse } from '@/lib/security'
import { checkRateLimit, createRateLimitedResponse } from '@/lib/rateLimit'

export const Route = createFileRoute('/api/auth/discord/callback')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const clientIP =
          request.headers.get('x-forwarded-for') ||
          request.headers.get('cf-connecting-ip') ||
          'unknown'
        const rateLimit = checkRateLimit(`discord_callback_${clientIP}`)

        if (!rateLimit.allowed) {
          return createRateLimitedResponse(rateLimit.resetTime!)
        }

        const url = new URL(request.url)
        const code = url.searchParams.get('code')
        const error = url.searchParams.get('error')

        if (error) {
          return createSecureResponse(null, {
            status: 302,
            headers: {
              Location: '/?error=' + encodeURIComponent(error),
            },
          })
        }

        if (!code) {
          return createSecureResponse(null, {
            status: 302,
            headers: {
              Location: '/?error=no_code',
            },
          })
        }

        try {
          // Exchange code for access token
          const tokenResponse = await fetch(
            'https://discord.com/api/oauth2/token',
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
              },
              body: new URLSearchParams({
                client_id: env.DISCORD_CLIENT_ID,
                client_secret: env.DISCORD_CLIENT_SECRET,
                grant_type: 'authorization_code',
                code,
                redirect_uri: `${env.SERVER_URL}/api/auth/discord/callback`,
              }),
            },
          )

          if (!tokenResponse.ok) {
            throw new Error('Failed to get access token')
          }

          const tokenData = await tokenResponse.json()
          const accessToken = tokenData.access_token

          // Get user info
          const userResponse = await fetch(
            'https://discord.com/api/users/@me',
            {
              headers: {
                Authorization: `Bearer ${accessToken}`,
              },
            },
          )

          if (!userResponse.ok) {
            throw new Error('Failed to get user info')
          }

          const user = await userResponse.json()

          // Get user guilds
          const guildsResponse = await fetch(
            'https://discord.com/api/users/@me/guilds',
            {
              headers: {
                Authorization: `Bearer ${accessToken}`,
              },
            },
          )

          if (!guildsResponse.ok) {
            throw new Error('Failed to get guilds')
          }

          const guilds = await guildsResponse.json()
          const isInGuild = guilds.some(
            (guild: any) => guild.id === env.GUILD_ID,
          )

          if (!isInGuild) {
            return createSecureResponse(null, {
              status: 302,
              headers: {
                Location: '/?error=not_in_guild',
              },
            })
          }

          // Success, set cookie and redirect
          const userData = JSON.stringify({
            id: user.id,
            username: user.username,
            avatar: user.avatar || '',
          })

          return createSecureResponse(null, {
            status: 302,
            headers: {
              Location: '/?verified=true',
              'Set-Cookie': `discord_user=${encodeURIComponent(userData)}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=86400`, // 1 day, secure cookie
            },
          })
        } catch (err) {
          console.error('Discord OAuth error:', err)
          return createSecureResponse(null, {
            status: 302,
            headers: {
              Location: '/?error=server_error',
            },
          })
        }
      },
    },
  },
})
