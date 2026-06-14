# Minstrel

A web interface to browse songs shared in your Discord server. Requires the [minstrel-bot](https://github.com/ABritex/minstrel-bot) to populate the database.

## Stack

- **Frontend:** React 19, TanStack Router, TanStack Query, Tailwind CSS v4, OGL (WebGL)
- **API:** Vercel Serverless Functions (`@vercel/node`)
- **Database:** PostgreSQL via Neon (shared with the Discord bot)
- **Auth:** Discord OAuth2 with signed JWT sessions

## Features

- Discord OAuth2 login with signed JWT sessions (no forgeable cookies)
- Guild membership verified at login and re-checked periodically (5-min cache)
- Responsive 3–4 column grid layout with YouTube thumbnails + lazy-loaded titles
- Platform badges, Discord avatars, and domain tags per song
- FerroFluid WebGL animated background on login
- Auto-refreshes every 60 seconds
- Security headers + rate limiting on all API endpoints
- Zod environment variable validation (fail-fast on missing config)
- CSP meta tag + HSTS via Vercel headers

## Development

```bash
npm install
npm run dev        # starts Vite dev server on port 3000
npm run build      # production build
npm run lint       # ESLint
```

## Environment Variables

Set these in your Vercel project dashboard (not in a local .env):

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `DISCORD_CLIENT_ID` | Discord OAuth app client ID |
| `DISCORD_CLIENT_SECRET` | Discord OAuth app client secret |
| `BOT_TOKEN` | Discord bot token (for fetching user avatars + guild verification) |
| `GUILD_ID` | Discord server ID to restrict access |
| `SERVER_URL` | Your Vercel deployment URL |
| `SESSION_SECRET` | Random string >= 32 characters for JWT signing |
| `RENDER_BOT_URL` | Render bot URL for keep-alive pings (optional) |

## Deployment

1. Push to GitHub and import to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy — Vercel builds the SPA and deploys the API functions

## Architecture

```
minstrel-bot/          # Discord bot (ingests songs)
minstel-web-cnq/       # This repo — web app (presents songs)
  ├── api/             # Vercel serverless functions
  │   ├── auth/        # Discord OAuth flow + JWT session handling
  │   ├── lib/         # Shared: env validation, JWT, headers, rate limiting
  │   ├── songs.ts     # Song list endpoint with YouTube video ID extraction
  │   └── cron-keep-alive.ts
  └── src/             # React SPA
      ├── routes/      # TanStack Router pages (login, index)
      └── components/  # FerroFluid, SongList, UI primitives
```

## License

MIT
