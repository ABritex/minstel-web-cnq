# Minstrel

A web interface to browse songs shared in your Discord server. Requires the [minstrel-bot](https://github.com/ABritex/minstrel-bot) to populate the database.

## Stack

- **Frontend:** React 19, TanStack Router, TanStack Query, Tailwind CSS v4
- **API:** Vercel Serverless Functions
- **Database:** PostgreSQL via Neon (shared with the Discord bot)

## Features

- Discord OAuth authentication with guild membership check
- Clean, minimalist song list with platform badges and user avatars
- Auto-refreshes every 60 seconds

## Development

```bash
npm install
npm run dev
```

## Environment Variables

Set these in your Vercel project dashboard (not in a local .env):

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `DISCORD_CLIENT_ID` | Discord OAuth app client ID |
| `DISCORD_CLIENT_SECRET` | Discord OAuth app client secret |
| `BOT_TOKEN` | Discord bot token (for fetching user avatars) |
| `GUILD_ID` | Discord server ID to restrict access |
| `SERVER_URL` | Your Vercel deployment URL |
| `RENDER_BOT_URL` | Render bot URL for keep-alive pings |

## Deployment

1. Push to GitHub and import to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy — Vercel builds the SPA and deploys the API functions

## License

MIT
