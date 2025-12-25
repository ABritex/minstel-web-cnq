import { env } from '@/env'

interface Config {
    isDevelopment: boolean
    isStaging: boolean
    isProduction: boolean
    database: {
        url: string
        poolSize: number
    }
    security: {
        sessionSecret: string
        corsOrigin?: string
        rateLimit: {
            windowMs: number
            maxRequests: number
        }
    }
    server: {
        url: string
        port: number
    }
    discord: {
        clientId: string
        clientSecret: string
        botToken: string
        guildId: string
        songChannelId: string
    }
}

const config: Config = {
    isDevelopment: env.NODE_ENV === 'development',
    isStaging: env.NODE_ENV === 'staging',
    isProduction: env.NODE_ENV === 'production',
    database: {
        url: env.DATABASE_URL,
        poolSize: env.NODE_ENV === 'production' ? 20 : 10,
    },
    security: {
        sessionSecret: env.SESSION_SECRET,
        corsOrigin: env.CORS_ORIGIN,
        rateLimit: {
            windowMs: env.RATE_LIMIT_WINDOW_MS,
            maxRequests: env.RATE_LIMIT_MAX_REQUESTS,
        },
    },
    server: {
        url: env.SERVER_URL,
        port: 3000, // Can be made configurable if needed
    },
    discord: {
        clientId: env.DISCORD_CLIENT_ID,
        clientSecret: env.DISCORD_CLIENT_SECRET,
        botToken: env.BOT_TOKEN,
        guildId: env.GUILD_ID,
        songChannelId: env.SONG_CHANNEL_ID,
    },
}

export default config
