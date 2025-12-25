# Minstrel

A Discord music sharing platform that lets users view songs shared in their Discord server through a web interface.

**Bot Repository**: [minstrel-bot](https://github.com/ABritex/minstrel-bot)

## Features

- Discord OAuth authentication
- Multi-platform song support (YouTube, Spotify, SoundCloud, etc.)
- Responsive web interface
- Secure API with rate limiting

## Quick Start

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Set up environment**
   ```bash
   cp .env.example .env.local
   ```
   Configure your Discord app credentials and database URL.

3. **Set up database**
   ```bash
   npm run db:generate
   npm run db:migrate
   ```

4. **Run development server**
   ```bash
   npm run dev
   ```

## Environment Variables

Required variables in `.env.local`:
- `DATABASE_URL` - PostgreSQL connection string
- `DISCORD_CLIENT_ID` - Discord app client ID
- `DISCORD_CLIENT_SECRET` - Discord app client secret
- `BOT_TOKEN` - Discord bot token
- `GUILD_ID` - Your Discord server ID
- `SONG_CHANNEL_ID` - Channel ID for song sharing
- `SESSION_SECRET` - Random string for sessions

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run test` - Run tests
- `npm run db:migrate` - Run database migrations

## Deployment

Deploy to Vercel by connecting your GitHub repo and setting environment variables in the Vercel dashboard.

## License

MIT - see [LICENSE](LICENSE) file
