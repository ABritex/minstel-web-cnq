import { createFileRoute } from '@tanstack/react-router'
import { createSecureJsonResponse } from '@/lib/security'

export const Route = createFileRoute('/api/auth/me')({
  server: {
    handlers: {
      GET: ({ request }) => {
        try {
          const cookies = request.headers.get('cookie') || ''
          const userCookie = cookies
            .split(';')
            .find((c) => c.trim().startsWith('discord_user='))
          if (!userCookie) {
            return createSecureJsonResponse(
              { error: 'No user session' },
              { status: 401 },
            )
          }
          const user = JSON.parse(decodeURIComponent(userCookie.split('=')[1]))
          return createSecureJsonResponse(user)
        } catch (error) {
          console.error('Error in /api/auth/me:', error)
          return createSecureJsonResponse(
            { error: 'Invalid session' },
            { status: 400 },
          )
        }
      },
    },
  },
})
