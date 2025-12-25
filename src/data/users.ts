import { createServerFn } from '@tanstack/react-start'
import { env } from '@/env'

export const getUserById = createServerFn({ method: 'GET' })
  .inputValidator((userId: string) => userId)
  .handler(async ({ data: userId }) => {
    try {
      const response = await fetch(`https://discord.com/api/users/${userId}`, {
        headers: {
          Authorization: `Bot ${env.BOT_TOKEN}`,
        },
      })

      if (!response.ok) {
        return null
      }

      const user = await response.json()
      return {
        id: user.id,
        username: user.username,
        avatar: user.avatar,
      }
    } catch (error) {
      return null
    }
  })
