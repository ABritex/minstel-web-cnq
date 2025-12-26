import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useMutation, useQueries, useQuery } from '@tanstack/react-query'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Image } from '@unpic/react'
import { AlertTriangle, RefreshCw, Play, Music, User, Shuffle, SkipBack, Pause, SkipForward, Repeat, Repeat1, Volume2 } from 'lucide-react'
import type { Song } from '@/data/types'
import { Button } from '@/components/ui/button'
import { Card, CardContent, } from '@/components/ui/card'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Progress } from '@/components/ui/progress'
import { getPlatform, getThumbnail, getTitle } from '@/lib/songUtils'
import { getCurrentUser } from '@/lib/auth'
import { getSongs } from '@/data/songs'
import { getUserById } from '@/data/users'
import { SongList } from '@/components/SongList'

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
        data: songs = [],
        isLoading: songsLoading,
        error: songsError,
        refetch: refetchSongs,
    } = useQuery<Array<Song>>({
        queryKey: ['songs'],
        queryFn: getSongs,
    })

    const titleQueries = useQueries({
        queries: songs.map((song) => ({
            queryKey: ['song-title', song.id],
            queryFn: () => getTitle(song.url, song.platform || getPlatform(song.url)),
            staleTime: 1000 * 60 * 60,
        })),
    })

    const titlesMap = useMemo(() => {
        const map: Record<number, string> = {}
        songs.forEach((song, index) => {
            map[song.id] = titleQueries[index]?.data || song.url
        })
        return map
    }, [songs, titleQueries])

    const uniqueUserIds = useMemo(
        () => [...new Set(songs.map((s) => s.userId))],
        [songs],
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
    const [shuffledIndices, setShuffledIndices] = useState<number[]>([])
    const [progress, setProgress] = useState(0)
    const [currentTime, setCurrentTime] = useState(0)
    const [duration, setDuration] = useState(0)
    const audioRef = useRef<HTMLAudioElement>(null)

    const currentSong = currentSongIndex !== null ? songs[currentSongIndex] : null
    const currentTitle = currentSong ? titlesMap[currentSong.id] || currentSong.url : ''
    const currentThumbnail = currentSong ? getThumbnail(currentSong.url, currentSong.platform || getPlatform(currentSong.url)) : null

    const togglePlay = () => {
        if (currentSongIndex === null && songs.length > 0) {
            setCurrentSongIndex(0)
            setIsPlaying(true)
        } else {
            setIsPlaying(!isPlaying)
        }
    }

    const playNext = () => {
        if (songs.length === 0) return

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
            if (currentSongIndex! < songs.length - 1) {
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
        if (songs.length === 0) return

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
                    prevIndex = songs.length - 1
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
            const indices = Array.from({ length: songs.length }, (_, i) => i)
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

    const getRepeatIcon = () => {
        switch (repeatMode) {
            case 'all': return <Repeat className="h-5 w-5" />
            case 'one': return <Repeat1 className="h-5 w-5" />
            default: return <Repeat className="h-5 w-5 opacity-40" />
        }
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

    const handleRetryUser = () => {
        refetchUser()
    }

    const handleRetrySongs = () => {
        refetchSongs()
    }

    const formatTime = (time: number) => {
        const minutes = Math.floor(time / 60)
        const seconds = Math.floor(time % 60)
        return `${minutes}:${seconds.toString().padStart(2, '0')}`
    }

    return (
        <div className="h-screen text-white flex flex-col overflow-hidden">
            {/* Main content area - 2 columns */}
            <div className="flex-1 flex overflow-hidden p-4 gap-4">
                {/* Left sidebar - Song list */}
                <Card className="flex-1 flex flex-col">
                    <CardContent className="p-0 flex flex-col h-full">
                        {/* Header */}
                        <div className="p-6 border-b border-zinc-800">
                            <h1 className="text-2xl font-bold mb-1">Minstrel</h1>
                            <p className="text-sm text-zinc-400">Your Music Library</p>
                        </div>

                        {/* Song list */}
                        <div className="flex-1 overflow-y-auto">
                            <SongList
                                songs={songs}
                                titlesMap={titlesMap}
                                usersMap={usersMap}
                                songsLoading={songsLoading}
                                songsError={songsError}
                                onRetrySongs={handleRetrySongs}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Right side - Now playing info */}
                {currentSong && (
                    <div className="flex-1 ">
                        <Card className="w-full h-full ">
                            <CardContent className="p-12 flex flex-col items-center h-full">
                                {/* Album art */}
                                <div className="w-full max-w-md h-80 mb-8 rounded-lg shadow-2xl overflow-hidden bg-zinc-800">
                                    {currentThumbnail ? (
                                        <Image
                                            src={currentThumbnail}
                                            alt="Current song"
                                            width={400}
                                            height={320}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <Music className="h-32 w-32 text-zinc-600" />
                                        </div>
                                    )}
                                </div>

                                {/* Song info */}
                                <div className="w-full text-center">
                                    <h2 className="text-3xl font-bold mb-2 truncate">{currentTitle}</h2>
                                    <p className="text-zinc-400">Track {currentSongIndex! + 1} of {songs.length}</p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}
            </div>

            {/* Bottom player controls - fixed height */}
            <div className="h-24  flex items-center px-4">
                <div className="w-full flex items-center justify-between">
                    {/* Left - Current song info */}
                    <div className="flex items-center space-x-3 w-80">
                        {currentThumbnail ? (
                            <Image
                                src={currentThumbnail}
                                alt="Current song"
                                width={56}
                                height={56}
                                className="w-14 h-14 rounded object-cover"
                            />
                        ) : (
                            <div className="w-14 h-14 rounded bg-zinc-800 flex items-center justify-center">
                                <Music className="h-6 w-6 text-zinc-600" />
                            </div>
                        )}
                        <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium truncate">
                                {currentSong ? currentTitle : 'No song selected'}
                            </p>
                            <p className="text-xs text-zinc-400 truncate">
                                {currentSong ? `Track ${currentSongIndex! + 1} of ${songs.length}` : 'Select a song to play'}
                            </p>
                        </div>
                    </div>

                    {/* Center - Controls */}
                    <div className="flex-1 max-w-2xl mx-8">
                        <div className="flex items-center justify-center space-x-4 mb-2">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={toggleShuffle}
                                className={`${isShuffled ? 'text-green-500' : 'text-zinc-400'} hover:text-white`}
                            >
                                <Shuffle className="h-5 w-5" />
                            </Button>

                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={playPrevious}
                                disabled={songs.length === 0}
                                className="text-zinc-400 hover:text-white"
                            >
                                <SkipBack className="h-5 w-5" />
                            </Button>

                            <Button
                                variant="default"
                                size="lg"
                                onClick={togglePlay}
                                className="rounded-full w-12 h-12 bg-white text-black hover:bg-white/90 hover:scale-105 transition-transform"
                            >
                                {isPlaying ? (
                                    <Pause className="h-5 w-5" />
                                ) : (
                                    <Play className="h-5 w-5 ml-0.5" />
                                )}
                            </Button>

                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={playNext}
                                disabled={songs.length === 0}
                                className="text-zinc-400 hover:text-white"
                            >
                                <SkipForward className="h-5 w-5" />
                            </Button>

                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={toggleRepeat}
                                className={`${repeatMode !== 'off' ? 'text-green-500' : 'text-zinc-400'} hover:text-white`}
                            >
                                {getRepeatIcon()}
                            </Button>
                        </div>

                        {/* Progress bar */}
                        <div className="flex items-center space-x-2">
                            <span className="text-xs text-zinc-400 w-10 text-right">{formatTime(currentTime)}</span>
                            <Progress value={progress} className="flex-1 h-1 bg-zinc-700" />
                            <span className="text-xs text-zinc-400 w-10">{formatTime(duration)}</span>
                        </div>
                    </div>

                    {/* Right - User profile */}
                    <div className="w-80 flex justify-end">
                        {user && (
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button variant="ghost" className="flex items-center space-x-2 hover:bg-zinc-800">
                                        {user.avatar && (
                                            <Image
                                                src={`https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`}
                                                alt="Avatar"
                                                width={32}
                                                height={32}
                                                className="w-8 h-8 rounded-full"
                                            />
                                        )}
                                        <span className="text-sm font-medium">{user.username}</span>
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-56 bg-zinc-800 border-zinc-700" align="end">
                                    <div className="space-y-2">
                                        <p className="text-sm text-zinc-400">
                                            Verified and in the guild
                                        </p>
                                        <Button
                                            onClick={handleLogout}
                                            variant="destructive"
                                            className="w-full"
                                        >
                                            Logout
                                        </Button>
                                    </div>
                                </PopoverContent>
                            </Popover>
                        )}
                    </div>
                </div>
            </div>
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