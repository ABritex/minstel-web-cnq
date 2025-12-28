import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useMutation, useQueries, useQuery } from '@tanstack/react-query'
import { useEffect, useMemo, useRef, useState } from 'react'
import type { Song } from '@/data/types'
import { Card, CardContent } from '@/components/ui/card'
import { getPlatform, getThumbnail, getTitle } from '@/lib/songUtils'
import { getCurrentUser } from '@/lib/auth'
import { getSongs } from '@/data/songs'
import { getUserById } from '@/data/users'
import { SongList } from '@/components/SongList'
import { PlayerControls } from '@/components/PlayerControls'
import { NowPlaying } from '@/components/NowPlaying'

export const Route = createFileRoute('/')({ component: App })

export function App() {
    const navigate = useNavigate()

    const {
        data: user,
        isLoading: userLoading,
        error: userError,
        refetch: refetchUser,
    } = useQuery({
        queryKey: ['currentUser'],
        queryFn: getCurrentUser,
    })

    const {
        data: songsData = [],
        isLoading: songsLoading,
        error: songsError,
        refetch: refetchSongs,
    } = useQuery<Array<Song>>({
        queryKey: ['songs'],
        queryFn: async () => {
            const songs = await getSongs()
            const songsWithTitles = await Promise.all(
                songs.map(async (song) => ({
                    ...song,
                    title: await getTitle(song.url, song.platform || getPlatform(song.url))
                }))
            )
            return songsWithTitles
        },
        staleTime: 1000 * 60 * 60,
    })

    const uniqueUserIds = useMemo(
        () => [...new Set(songsData.map((s) => s.userId))],
        [songsData],
    )
    const userQueries = useQueries({
        queries: uniqueUserIds.map((userId) => ({
            queryKey: ['user', userId],
            queryFn: () => getUserById({ data: userId }),
            staleTime: 1000 * 60 * 60,
        })),
    })

    const usersMap = useMemo(() => {
        const map: Record<string, any> = {}
        uniqueUserIds.forEach((userId, index) => {
            map[userId] = userQueries[index]?.data || null
        })
        return map
    }, [uniqueUserIds, userQueries])

    const logoutMutation = useMutation({
        mutationFn: async () => {
            await fetch('/api/auth/logout', { method: 'POST' })
        },
        onSuccess: () => {
            navigate({ to: '/login' })
        },
    })

    type RepeatMode = 'off' | 'all' | 'one'
    const [currentSongIndex, setCurrentSongIndex] = useState<number | null>(null)
    const [isPlaying, setIsPlaying] = useState(false)
    const [isShuffled, setIsShuffled] = useState(false)
    const [repeatMode, setRepeatMode] = useState<RepeatMode>('off')
    const [shuffledIndices, setShuffledIndices] = useState<Array<number>>([])
    const [progress, setProgress] = useState(0)
    const [currentTime, setCurrentTime] = useState(0)
    const [duration, setDuration] = useState(0)
    const [leftPanelWidth, setLeftPanelWidth] = useState('50%')
    const audioRef = useRef<HTMLAudioElement>(null)
    const containerRef = useRef<HTMLDivElement>(null)

    const currentSong = currentSongIndex !== null ? songsData[currentSongIndex] : null
    const currentTitle = currentSong ? currentSong.title || currentSong.url : ''
    const currentThumbnail = currentSong ? getThumbnail(currentSong.url, currentSong.platform || getPlatform(currentSong.url)) : null

    const togglePlay = () => {
        if (currentSongIndex === null && songsData.length > 0) {
            setCurrentSongIndex(0)
            setIsPlaying(true)
        } else {
            setIsPlaying(!isPlaying)
        }
    }

    const playNext = () => {
        if (songsData.length === 0) return

        let nextIndex: number

        if (isShuffled && shuffledIndices.length > 0) {
            const currentPos = shuffledIndices.indexOf(currentSongIndex!)
            if (currentPos < shuffledIndices.length - 1) {
                nextIndex = shuffledIndices[currentPos + 1]
            } else {
                if (repeatMode === 'all') {
                    nextIndex = shuffledIndices[0]
                } else {
                    setIsPlaying(false)
                    return
                }
            }
        } else {
            if (currentSongIndex! < songsData.length - 1) {
                nextIndex = currentSongIndex! + 1
            } else {
                if (repeatMode === 'all') {
                    nextIndex = 0
                } else {
                    setIsPlaying(false)
                    return
                }
            }
        }

        setCurrentSongIndex(nextIndex)
        setIsPlaying(true)
    }

    const playPrevious = () => {
        if (songsData.length === 0) return

        let prevIndex: number

        if (isShuffled && shuffledIndices.length > 0) {
            const currentPos = shuffledIndices.indexOf(currentSongIndex!)
            if (currentPos > 0) {
                prevIndex = shuffledIndices[currentPos - 1]
            } else {
                if (repeatMode === 'all') {
                    prevIndex = shuffledIndices[shuffledIndices.length - 1]
                } else {
                    prevIndex = shuffledIndices[0]
                }
            }
        } else {
            if (currentSongIndex! > 0) {
                prevIndex = currentSongIndex! - 1
            } else {
                if (repeatMode === 'all') {
                    prevIndex = songsData.length - 1
                } else {
                    prevIndex = 0
                }
            }
        }

        setCurrentSongIndex(prevIndex)
        setIsPlaying(true)
    }

    const toggleShuffle = () => {
        setIsShuffled(!isShuffled)
        if (!isShuffled) {
            const indices = Array.from({ length: songsData.length }, (_, i) => i)
            for (let i = indices.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1))
                    ;[indices[i], indices[j]] = [indices[j], indices[i]]
            }
            setShuffledIndices(indices)
        } else {
            setShuffledIndices([])
        }
    }

    const toggleRepeat = () => {
        setRepeatMode(current => {
            switch (current) {
                case 'off': return 'all'
                case 'all': return 'one'
                case 'one': return 'off'
                default: return 'off'
            }
        })
    }

    useEffect(() => {
        if (!userLoading && !user) {
            navigate({ to: '/login' })
        }
    }, [user, userLoading, navigate])

    useEffect(() => {
        const audio = audioRef.current
        if (audio && currentSong) {
            audio.src = currentSong.url
            if (isPlaying) {
                audio.play()
            }
        }
    }, [currentSong, isPlaying])

    const handleLogout = () => {
        logoutMutation.mutate()
    }

    const handleRetrySongs = () => {
        refetchSongs()
    }

    const formatTime = (time: number) => {
        const minutes = Math.floor(time / 60)
        const seconds = Math.floor(time % 60)
        return `${minutes}:${seconds.toString().padStart(2, '0')}`
    }

    const handleMouseDown = (e: React.MouseEvent) => {
        if (!containerRef.current) return
        const rect = containerRef.current.getBoundingClientRect()
        const startX = e.clientX
        const startWidthPercent = parseFloat(leftPanelWidth.replace('%', ''))
        const startWidth = rect.width * (startWidthPercent / 100)

        const handleMouseMove = (event: MouseEvent) => {
            const deltaX = event.clientX - startX
            const newWidth = startWidth + deltaX
            const newWidthPercent = (newWidth / rect.width) * 100
            setLeftPanelWidth(`${Math.max(0, Math.min(100, newWidthPercent))}%`)
        }

        const handleMouseUp = () => {
            document.removeEventListener('mousemove', handleMouseMove)
            document.removeEventListener('mouseup', handleMouseUp)
        }

        document.addEventListener('mousemove', handleMouseMove)
        document.addEventListener('mouseup', handleMouseUp)
    }

    return (
        <div className="h-screen text-white flex flex-col overflow-hidden">
            <div ref={containerRef} className="bg-black flex-1 flex flex-col lg:flex-row overflow-hidden p-2 sm:p-4 gap-2 sm:gap-2">
                <Card className="flex-1 flex flex-col min-h-0 border-0" style={currentSong ? { flex: `0 0 ${leftPanelWidth}`, minWidth: 0 } : { flex: '1' }}>
                    <CardContent className="p-0 flex flex-col h-full">
                        <div className="p-4 sm:p-6 border-b border-zinc-800">
                            <h1 className="text-xl sm:text-2xl font-bold mb-1">Minstrel</h1>
                            <p className="text-xs sm:text-sm text-zinc-400">Your Music Library</p>
                        </div>
                        <div className="flex-1 overflow-y-auto min-h-0">
                            <SongList
                                songs={songsData}
                                usersMap={usersMap}
                                songsLoading={songsLoading}
                                songsError={songsError}
                                onRetrySongs={handleRetrySongs}
                            />
                        </div>
                    </CardContent>
                </Card>

                {currentSong && (
                    <div
                        className="w-0.5 bg-zinc-700 cursor-col-resize opacity-0 hover:opacity-100 transition-opacity hidden lg:block"
                        onMouseDown={handleMouseDown}
                    />
                )}

                {currentSong && (
                    <Card className="w-full h-full border-0">
                        <CardContent>
                            <NowPlaying
                                currentSong={currentSong}
                                currentTitle={currentTitle}
                                currentThumbnail={currentThumbnail}
                                currentSongIndex={currentSongIndex}
                                songsLength={songsData.length}
                            />
                        </CardContent>
                    </Card>
                )}
            </div>

            <PlayerControls
                currentSong={currentSong}
                currentTitle={currentTitle}
                currentThumbnail={currentThumbnail}
                currentSongIndex={currentSongIndex}
                songsLength={songsData.length}
                isPlaying={isPlaying}
                togglePlay={togglePlay}
                toggleShuffle={toggleShuffle}
                isShuffled={isShuffled}
                playPrevious={playPrevious}
                playNext={playNext}
                toggleRepeat={toggleRepeat}
                repeatMode={repeatMode}
                progress={progress}
                currentTime={currentTime}
                duration={duration}
                formatTime={formatTime}
                user={user}
                handleLogout={handleLogout}
            />
            <audio
                ref={audioRef}
                onTimeUpdate={() => {
                    if (audioRef.current) {
                        setCurrentTime(audioRef.current.currentTime)
                        setDuration(audioRef.current.duration || 0)
                        setProgress((audioRef.current.currentTime / (audioRef.current.duration || 1)) * 100)
                    }
                }}
                onEnded={playNext}
            />
        </div>
    )
}
