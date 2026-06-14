import { z } from 'zod'

const envSchema = z.object({
    DATABASE_URL: z.string().url(),
    DISCORD_CLIENT_ID: z.string().min(1),
    DISCORD_CLIENT_SECRET: z.string().min(1),
    BOT_TOKEN: z.string().min(1),
    GUILD_ID: z.string().min(1),
    SERVER_URL: z.string().url(),
    SESSION_SECRET: z.string().min(32, 'SESSION_SECRET must be at least 32 characters'),
    RENDER_BOT_URL: z.string().url().optional(),
})

function validateEnv() {
    const result = envSchema.safeParse(process.env)
    if (!result.success) {
        console.error('Invalid environment variables:', result.error.flatten().fieldErrors)
        throw new Error(`Environment validation failed: ${JSON.stringify(result.error.flatten().fieldErrors)}`)
    }
    return result.data
}

let cachedEnv: z.infer<typeof envSchema> | null = null

export function getEnv() {
    if (!cachedEnv) {
        cachedEnv = validateEnv()
    }
    return cachedEnv
}
