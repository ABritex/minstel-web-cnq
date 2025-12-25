import { createFileRoute } from '@tanstack/react-router'
import { createSecureResponse } from '@/lib/security'

export const Route = createFileRoute('/api/auth/logout')({
  server: {
    handlers: {
      POST: () => {
        return createSecureResponse(null, {
          status: 200,
          headers: {
            'Set-Cookie':
              'discord_user=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0',
          },
        })
      },
    },
  },
})
