import type { Song } from './types'

export async function getSongs(): Promise<Array<Song>> {
    const res = await fetch('/api/songs')
    if (!res.ok) throw new Error('Failed to fetch songs')
    return res.json()
}
