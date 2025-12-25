import { pgTable, serial, text } from 'drizzle-orm/pg-core'

export const songs = pgTable('songs', {
  id: serial('id').primaryKey(),
  serverId: text('server_id').notNull(),
  channelId: text('channel_id').notNull(),
  messageId: text('message_id').notNull(),
  userId: text('user_id').notNull(),
  url: text('url').notNull(),
  platform: text('platform'),
})
