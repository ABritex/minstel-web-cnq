import { createEnv } from '@t3-oss/env-core'
import { z } from 'zod'

export const env = createEnv({
    server: {
        NODE_ENV: z
            .enum(['development', 'staging', 'production'])
            .default('development'),
        SERVER_URL: z.string().url(),
        DATABASE_URL: z.string().url(),
        DISCORD_CLIENT_ID: z.string(),
        DISCORD_CLIENT_SECRET: z.string(),
        BOT_TOKEN: z.string(),
        GUILD_ID: z.string(),
        SONG_CHANNEL_ID: z.string(),
        SESSION_SECRET: z.string().min(32).default('development_session_secret_that_is_at_least_32_characters_long_for_development_only'),
        CORS_ORIGIN: z.string().url().optional(),
        RATE_LIMIT_WINDOW_MS: z.coerce.number().default(900000), // 15 minutes
        RATE_LIMIT_MAX_REQUESTS: z.coerce.number().default(100),
    },

    /**
     * The prefix that client-side variables must have. This is enforced both at
     * a type-level and at runtime.
     */
    clientPrefix: 'VITE_',

    client: {
        VITE_APP_TITLE: z.string().min(1).optional(),
    },

    /**
     * What object holds the environment variables at runtime. This is usually
     * `process.env` or `import.meta.env`.
     */
    runtimeEnv: process.env,

    /**
     * By default, this library will feed the environment variables directly to
     * the Zod validator.
     *
     * This means that if you have an empty string for a value that is supposed
     * to be a number (e.g. `PORT=` in a ".env" file), Zod will incorrectly flag
     * it as a type mismatch violation. Additionally, if you have an empty string
     * for a value that is supposed to be a string with a default value (e.g.
     * `DOMAIN=` in an ".env" file), the default value will never be applied.
     *
     * In order to solve these issues, we recommend that all new projects
     * explicitly specify this option as true.
     */
    emptyStringAsUndefined: true,
})
