import jwt from 'jsonwebtoken'
import { getEnv } from './env'

export interface UserPayload {
    id: string
    username: string
    avatar: string
}

export function signUserToken(user: UserPayload): string {
    const env = getEnv()
    return jwt.sign({ id: user.id, username: user.username, avatar: user.avatar }, env.SESSION_SECRET, {
        expiresIn: '24h',
    })
}

export function verifyUserToken(token: string): UserPayload | null {
    try {
        const env = getEnv()
        const decoded = jwt.verify(token, env.SESSION_SECRET) as UserPayload
        return { id: decoded.id, username: decoded.username, avatar: decoded.avatar }
    } catch {
        return null
    }
}
