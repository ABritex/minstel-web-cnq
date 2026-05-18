import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
import type { Song } from '@/data/types'
import { getCurrentUser } from '@/lib/auth'
import { getSongs } from '@/data/songs'
import { SongList } from '@/components/SongList'

export const Route = createFileRoute('/')({ component: App })

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
                <div className="max-w-3xl mx-auto px-4 h-12 flex items-center justify-between">
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

            <main className="max-w-3xl mx-auto px-4 py-6">
                <SongList
                    songs={songsData}
                    songsLoading={songsLoading}
                    songsError={songsError}
                    onRetrySongs={() => refetchSongs()}
                />
            </main>
        </div>
    )
}
