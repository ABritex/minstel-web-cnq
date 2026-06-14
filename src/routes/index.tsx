import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
import { ExternalLink, Music } from 'lucide-react'
import type { Song } from '@/data/types'
import { getCurrentUser } from '@/lib/auth'
import { getSongs } from '@/data/songs'

export const Route = createFileRoute('/')({ component: App })

const YT_THUMB = (id: string) => `https://img.youtube.com/vi/${id}/mqdefault.jpg`

function extractDomain(url: string) {
    try { return new URL(url).hostname.replace('www.', '') } catch { return url }
}

function SongCard({ song }: { song: Song }) {
    const displayTitle = song.title || song.url.replace(/^https?:\/\//, '').replace(/\/$/, '')

    return (
        <a
            href={song.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group block bg-zinc-900/60 border border-zinc-800/50 rounded-xl overflow-hidden hover:border-zinc-700/60 hover:bg-zinc-900 transition-all duration-200"
        >
            <div className="aspect-video bg-zinc-800 overflow-hidden relative">
                {song.videoId ? (
                    <img
                        src={YT_THUMB(song.videoId)}
                        alt=""
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <Music className="h-8 w-8 text-zinc-600" />
                    </div>
                )}
                <div className="absolute top-2 right-2">
                    <span className="text-[10px] px-1.5 py-0.5 bg-black/60 rounded text-zinc-400 uppercase tracking-wider backdrop-blur-sm">
                        {song.platform || 'Unknown'}
                    </span>
                </div>
            </div>
            <div className="p-3 space-y-1.5">
                <div className="flex items-start justify-between gap-2">
                    <p className="text-sm text-zinc-200 leading-snug line-clamp-2 flex-1 min-w-0">
                        {displayTitle}
                    </p>
                    <ExternalLink className="h-3.5 w-3.5 text-zinc-600 shrink-0 mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <div className="flex items-center gap-2">
                    {song.user && (
                        <>
                            {song.user.avatar ? (
                                <img
                                    src={`https://cdn.discordapp.com/avatars/${song.user.id}/${song.user.avatar}.png`}
                                    alt=""
                                    className="w-4 h-4 rounded-full"
                                />
                            ) : (
                                <div className="w-4 h-4 rounded-full bg-zinc-700 flex items-center justify-center">
                                    <Music className="h-2.5 w-2.5 text-zinc-500" />
                                </div>
                            )}
                            <span className="text-xs text-zinc-500 truncate">{song.user.username}</span>
                        </>
                    )}
                    <span className="text-[10px] text-zinc-600 ml-auto">{extractDomain(song.url)}</span>
                </div>
            </div>
        </a>
    )
}

function App() {
    const navigate = useNavigate()
    const queryClient = useQueryClient()

    const { data: user, isLoading: userLoading } = useQuery({
        queryKey: ['currentUser'],
        queryFn: getCurrentUser,
        retry: false,
    })

    const {
        data: songsData = [],
        isLoading: songsLoading,
        error: songsError,
        refetch: refetchSongs,
    } = useQuery<Array<Song>>({
        queryKey: ['songs'],
        queryFn: getSongs,
        refetchInterval: 60_000,
        staleTime: 30_000,
    })

    useEffect(() => {
        if (!userLoading && !user) {
            navigate({ to: '/login' })
        }
    }, [user, userLoading, navigate])

    if (userLoading) {
        return (
            <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
                <div className="text-zinc-500 text-sm">Loading...</div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-zinc-950 text-zinc-200">
            <header className="sticky top-0 z-10 bg-zinc-950/80 backdrop-blur-sm border-b border-zinc-800/50">
                <div className="max-w-7xl mx-auto px-4 h-12 flex items-center justify-between">
                    <div>
                        <h1 className="text-sm font-medium">Minstrel</h1>
                        <p className="text-[10px] text-zinc-600">{songsData.length} songs</p>
                    </div>
                    {user && (
                        <button
                            onClick={() => {
                                fetch('/api/auth/logout', { method: 'POST' }).then(() => {
                                    queryClient.invalidateQueries({ queryKey: ['currentUser'] })
                                    navigate({ to: '/login' })
                                })
                            }}
                            className="text-xs text-zinc-600 hover:text-zinc-400"
                        >
                            {user.username} &middot; logout
                        </button>
                    )}
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 py-8">
                {songsError ? (
                    <div className="flex flex-col items-center justify-center py-16 text-zinc-500">
                        <p className="text-sm mb-2">Failed to load songs</p>
                        <button onClick={() => refetchSongs()} className="text-xs text-blue-400 hover:text-blue-300">
                            Try again
                        </button>
                    </div>
                ) : songsLoading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {Array.from({ length: 12 }).map((_, i) => (
                            <div key={i} className="bg-zinc-900/60 border border-zinc-800/50 rounded-xl overflow-hidden animate-pulse">
                                <div className="aspect-video bg-zinc-800" />
                                <div className="p-3 space-y-2">
                                    <div className="h-3 bg-zinc-800 rounded w-3/4" />
                                    <div className="h-2.5 bg-zinc-800 rounded w-1/2" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : songsData.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-zinc-500">
                        <Music className="h-10 w-10 mb-3" />
                        <p className="text-sm">No songs yet</p>
                        <p className="text-xs mt-1">Songs shared in your Discord server will appear here.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {songsData.map((song) => (
                            <SongCard key={song.id} song={song} />
                        ))}
                    </div>
                )}
            </main>
        </div>
    )
}
