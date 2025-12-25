import { createServerFn } from '@tanstack/react-start'
import { eq } from 'drizzle-orm'
import { db } from '@/db'
import { songs } from '@/db/schema'
import { env } from '@/env'

export const getSongs = createServerFn({
  method: 'GET',
}).handler(async () => {
  const songList = await db
    .select()
    .from(songs)
    .where(eq(songs.serverId, env.GUILD_ID))
    .orderBy(songs.id)

  return songList
})
