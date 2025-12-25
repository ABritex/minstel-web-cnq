import { beforeEach, describe, expect, it, vi } from 'vitest'
import { getPlatform, getThumbnail, getTitle } from './songUtils'

// Mock fetch globally
global.fetch = vi.fn()

describe('getPlatform', () => {
    it('detects YouTube', () => {
        expect(getPlatform('https://www.youtube.com/watch?v=123')).toBe('YouTube')
        expect(getPlatform('https://youtu.be/123')).toBe('YouTube')
    })

    it('detects YouTube Music', () => {
        expect(getPlatform('https://music.youtube.com/watch?v=123')).toBe(
            'YouTube Music',
        )
    })

    it('detects Spotify', () => {
        expect(getPlatform('https://open.spotify.com/track/123')).toBe('Spotify')
    })

    it('detects SoundCloud', () => {
        expect(getPlatform('https://soundcloud.com/artist/track')).toBe(
            'SoundCloud',
        )
    })

    it('detects Apple Music', () => {
        expect(getPlatform('https://music.apple.com/us/album/track')).toBe(
            'Apple Music',
        )
    })

    it('returns Unknown for unrecognized URLs', () => {
        expect(getPlatform('https://example.com')).toBe('Unknown')
    })
})

describe('getThumbnail', () => {
    it('returns YouTube thumbnail for YouTube URLs', () => {
        const url = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
        expect(getThumbnail(url, 'YouTube')).toBe(
            'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
        )
    })

    it('returns YouTube thumbnail for YouTube Music URLs', () => {
        const url = 'https://music.youtube.com/watch?v=dQw4w9WgXcQ'
        expect(getThumbnail(url, 'YouTube Music')).toBe(
            'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
        )
    })

    it('returns null for non-YouTube platforms', () => {
        expect(
            getThumbnail('https://open.spotify.com/track/123', 'Spotify'),
        ).toBeNull()
    })

    it('returns null for invalid YouTube URLs', () => {
        expect(getThumbnail('https://youtube.com/invalid', 'YouTube')).toBeNull()
    })
})

describe('getTitle', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('fetches YouTube title successfully', async () => {
        const mockResponse = { title: 'Test Video' }
            ; (global.fetch as any).mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve(mockResponse),
            })

        const result = await getTitle(
            'https://www.youtube.com/watch?v=123',
            'YouTube',
        )
        expect(result).toBe('Test Video')
        expect(global.fetch).toHaveBeenCalledWith(
            'https://www.youtube.com/oembed?url=https%3A%2F%2Fwww.youtube.com%2Fwatch%3Fv%3D123&format=json',
        )
    })

    it('returns URL on fetch failure', async () => {
        ; (global.fetch as any).mockRejectedValueOnce(new Error('Network error'))

        const url = 'https://www.youtube.com/watch?v=123'
        const result = await getTitle(url, 'YouTube')
        expect(result).toBe(url)
    })

    it('returns URL for non-YouTube platforms', async () => {
        const url = 'https://open.spotify.com/track/123'
        const result = await getTitle(url, 'Spotify')
        expect(result).toBe(url)
        expect(global.fetch).not.toHaveBeenCalled()
    })

    it('returns URL when oEmbed response is not ok', async () => {
        ; (global.fetch as any).mockResolvedValueOnce({
            ok: false,
        })

        const url = 'https://www.youtube.com/watch?v=123'
        const result = await getTitle(url, 'YouTube')
        expect(result).toBe(url)
    })
})
