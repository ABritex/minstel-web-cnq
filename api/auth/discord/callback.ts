import type { VercelRequest, VercelResponse } from '@vercel/node'

export default async function handler(req: VercelRequest, res: VercelResponse) {
    const { code, error: oauthError } = req.query

    if (oauthError) {
        res.redirect(302, '/login?error=' + encodeURIComponent(String(oauthError)))
        return
    }

    if (!code) {
        res.redirect(302, '/login?error=no_code')
        return
    }

    try {
        const clientId = process.env.DISCORD_CLIENT_ID!
        const clientSecret = process.env.DISCORD_CLIENT_SECRET!
        const serverUrl = process.env.SERVER_URL!
        const guildId = process.env.GUILD_ID!

        const tokenRes = await fetch('https://discord.com/api/oauth2/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
                client_id: clientId,
                client_secret: clientSecret,
                grant_type: 'authorization_code',
                code: String(code),
                redirect_uri: `${serverUrl}/api/auth/discord/callback`,
            }),
        })

        if (!tokenRes.ok) throw new Error('Failed to get access token')

        const tokenData = await tokenRes.json()
        const accessToken = tokenData.access_token

        const [userRes, guildsRes] = await Promise.all([
            fetch('https://discord.com/api/users/@me', {
                headers: { Authorization: `Bearer ${accessToken}` },
            }),
            fetch('https://discord.com/api/users/@me/guilds', {
                headers: { Authorization: `Bearer ${accessToken}` },
            }),
        ])

        if (!userRes.ok) throw new Error('Failed to get user info')
        if (!guildsRes.ok) throw new Error('Failed to get guilds')

        const user = await userRes.json()
        const guilds = await guildsRes.json()

        const isInGuild = guilds.some((g: any) => g.id === guildId)

        if (!isInGuild) {
            res.redirect(302, '/login?error=not_in_guild')
            return
        }

        const userData = JSON.stringify({
            id: user.id,
            username: user.username,
            avatar: user.avatar || '',
        })

        res.setHeader('Set-Cookie', `discord_user=${encodeURIComponent(userData)}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=86400`)
        res.redirect(302, '/login?verified=true')
    } catch (err) {
        console.error('Discord OAuth error:', err)
        res.redirect(302, '/login?error=server_error')
    }
}
