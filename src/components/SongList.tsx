import { Image } from '@unpic/react'
import { Music, User } from 'lucide-react'
import type { Song } from '@/data/types'
import { Skeleton } from '@/components/ui/skeleton'

interface SongListProps {
    songs: Array<Song>
    songsLoading: boolean
    songsError: Error | null
    onRetrySongs: () => void
}

export function SongList({ songs, songsLoading, songsError, onRetrySongs }: SongListProps) {
    if (songsError) {
        return (
            <div className="flex flex-col items-center justify-center py-16 text-zinc-500">
                <p className="text-sm mb-2">Failed to load songs</p>
                <button onClick={onRetrySongs} className="text-xs text-blue-400 hover:text-blue-300">
                    Try again
                </button>
            </div>
        )
    }

    if (songsLoading) {
        return (
            <div className="space-y-1">
                {Array.from({ length: 10 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-3 px-4 py-3">
                        <Skeleton className="w-10 h-10 rounded flex-shrink-0" />
                        <div className="flex-1 space-y-1.5">
                            <Skeleton className="h-3 w-3/4" />
                            <Skeleton className="h-2.5 w-1/4" />
                        </div>
                    </div>
                ))}
            </div>
        )
    }

    if (songs.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-16 text-zinc-500">
                <Music className="h-10 w-10 mb-3" />
                <p className="text-sm">No songs yet</p>
                <p className="text-xs mt-1">Songs shared in your Discord server will appear here.</p>
            </div>
        )
    }

    return (
        <div className="divide-y divide-zinc-800/50">
            {songs.map((song, index) => (
                <div
                    key={song.id}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-zinc-800/40 transition-colors group"
                >
                    <span className="text-xs text-zinc-600 w-5 text-right flex-shrink-0 font-mono">
                        {index + 1}
                    </span>

                    <div className="w-10 h-10 rounded overflow-hidden bg-zinc-800 flex-shrink-0">
                        {song.user?.avatar ? (
                            <Image
                                src={`https://cdn.discordapp.com/avatars/${song.user.id}/${song.user.avatar}.png`}
                                alt=""
                                width={40}
                                height={40}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center">
                                <Music className="h-4 w-4 text-zinc-600" />
                            </div>
                        )}
                    </div>

                    <div className="flex-1 min-w-0">
                        <a
                            href={song.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-zinc-200 hover:text-blue-400 block truncate"
                        >
                            {song.url}
                        </a>
                        <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[10px] px-1.5 py-0.5 bg-zinc-800 rounded text-zinc-500 uppercase tracking-wider">
                                {song.platform || 'Unknown'}
                            </span>
                            {song.user && (
                                <span className="text-xs text-zinc-600">
                                    {song.user.username}
                                </span>
                            )}
                        </div>
                    </div>

                    <a
                        href={song.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-zinc-600 hover:text-zinc-300 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                            <polyline points="15 3 21 3 21 9" />
                            <line x1="10" y1="14" x2="21" y2="3" />
                        </svg>
                    </a>
                </div>
            ))}
        </div>
    )
}
