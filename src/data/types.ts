export type Song = {
    id: number
    serverId: string
    channelId: string
    messageId: string
    userId: string
    url: string
    platform: string | null
    title?: string
    user?: {
        id: string
        username: string
        avatar: string
    } | null
}
