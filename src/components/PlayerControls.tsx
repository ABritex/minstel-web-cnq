import { Image } from '@unpic/react'
import { Music, Pause, Play, Repeat, Repeat1, Shuffle, SkipBack, SkipForward, User } from 'lucide-react'
import type { Song } from '@/data/types'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

interface PlayerControlsProps {
    currentSong: Song | null
    currentTitle: string
    currentThumbnail: string | null
    currentSongIndex: number | null
    songsLength: number
    isPlaying: boolean
    togglePlay: () => void
    toggleShuffle: () => void
    isShuffled: boolean
    playPrevious: () => void
    playNext: () => void
    toggleRepeat: () => void
    repeatMode: 'off' | 'all' | 'one'
    progress: number
    currentTime: number
    duration: number
    formatTime: (time: number) => string
    user: any
    handleLogout: () => void
}

export function PlayerControls({
    currentSong,
    currentTitle,
    currentThumbnail,
    currentSongIndex,
    songsLength,
    isPlaying,
    togglePlay,
    toggleShuffle,
    isShuffled,
    playPrevious,
    playNext,
    toggleRepeat,
    repeatMode,
    progress,
    currentTime,
    duration,
    formatTime,
    user,
    handleLogout,
}: PlayerControlsProps) {
    const getRepeatIcon = () => {
        switch (repeatMode) {
            case 'all': return <Repeat className="h-5 w-5" />
            case 'one': return <Repeat1 className="h-5 w-5" />
            default: return <Repeat className="h-5 w-5 opacity-40" />
        }
    }

    return (
        <div className="h-auto lg:h-24 bg-black ">
            <div className="w-full flex flex-col lg:flex-row items-center justify-between p-2 sm:p-4 gap-2 lg:gap-0">

                <div className="flex items-center space-x-2 sm:space-x-3 w-full lg:w-80 min-w-0">
                    {currentThumbnail ? (
                        <Image
                            src={currentThumbnail}
                            alt="Current song"
                            width={56}
                            height={56}
                            className="w-12 h-12 sm:w-14 sm:h-14 rounded object-cover flex-shrink-0"
                        />
                    ) : (
                        <div className="w-12 h-12 sm:w-14 sm:h-14 rounded bg-zinc-800 flex items-center justify-center flex-shrink-0">
                            <Music className="h-5 w-5 sm:h-6 sm:w-6 text-zinc-600" />
                        </div>
                    )}
                    <div className="min-w-0 flex-1">
                        <p className="text-xs sm:text-sm font-medium truncate">
                            {currentSong ? currentTitle : 'No song selected'}
                        </p>
                        <p className="text-xs text-zinc-400 truncate">
                            {currentSong ? `Track ${currentSongIndex! + 1} of ${songsLength}` : 'Select a song to play'}
                        </p>
                    </div>
                </div>

                {/* Center - Controls */}
                <div className="flex-1 w-full lg:max-w-2xl lg:mx-8">
                    <div className="flex items-center justify-center space-x-2 sm:space-x-4 mb-2">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={toggleShuffle}
                            className={`${isShuffled ? 'text-green-500' : 'text-zinc-400'} hover:text-white p-2`}
                        >
                            <Shuffle className="h-4 w-4 sm:h-5 sm:w-5" />
                        </Button>

                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={playPrevious}
                            disabled={songsLength === 0}
                            className="text-zinc-400 hover:text-white p-2"
                        >
                            <SkipBack className="h-4 w-4 sm:h-5 sm:w-5" />
                        </Button>

                        <Button
                            variant="default"
                            size="lg"
                            onClick={togglePlay}
                            className="rounded-full w-10 h-10 sm:w-12 sm:h-12 bg-white text-black hover:bg-white/90 hover:scale-105 transition-transform"
                        >
                            {isPlaying ? (
                                <Pause className="h-4 w-4 sm:h-5 sm:w-5" />
                            ) : (
                                <Play className="h-4 w-4 sm:h-5 sm:w-5 ml-0.5" />
                            )}
                        </Button>

                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={playNext}
                            disabled={songsLength === 0}
                            className="text-zinc-400 hover:text-white p-2"
                        >
                            <SkipForward className="h-4 w-4 sm:h-5 sm:w-5" />
                        </Button>

                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={toggleRepeat}
                            className={`${repeatMode !== 'off' ? 'text-green-500' : 'text-zinc-400'} hover:text-white p-2`}
                        >
                            {getRepeatIcon()}
                        </Button>
                    </div>

                    {/* Progress bar */}
                    <div className="flex items-center space-x-2">
                        <span className="text-xs text-zinc-400 w-8 sm:w-10 text-right">{formatTime(currentTime)}</span>
                        <Progress value={progress} className="flex-1 h-1 bg-zinc-700" />
                        <span className="text-xs text-zinc-400 w-8 sm:w-10">{formatTime(duration)}</span>
                    </div>
                </div>

                {/* Right - User profile */}
                <div className="w-full lg:w-80 flex justify-center lg:justify-end">
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
                                            className="w-6 h-6 sm:w-8 sm:h-8 rounded-full"
                                        />
                                    )}
                                    <span className="text-xs sm:text-sm font-medium">{user.username}</span>
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
    )
}