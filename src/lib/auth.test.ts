import { beforeEach, describe, expect, it, vi } from 'vitest'
import { getCurrentUser } from './auth'

describe('getCurrentUser', () => {
    beforeEach(() => {
        vi.stubGlobal('fetch', vi.fn())
    })

    it('returns user data on successful fetch', async () => {
        const mockUser = { id: '123', username: 'testuser' }
            ; (global.fetch as any).mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve(mockUser),
            })

        const result = await getCurrentUser()
        expect(result).toEqual(mockUser)
        expect(global.fetch).toHaveBeenCalledWith('/api/auth/me')
    })

    it('returns null on fetch failure', async () => {
        ; (global.fetch as any).mockResolvedValueOnce({
            ok: false,
        })

        const result = await getCurrentUser()
        expect(result).toBeNull()
    })
})
