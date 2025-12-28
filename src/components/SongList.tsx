import { Image } from '@unpic/react'
import { AlertTriangle, Music, Play, RefreshCw, User } from 'lucide-react'
import type { Song } from '@/data/types'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'
import { getPlatform, getThumbnail } from '@/lib/songUtils'

interface SongListProps {
    songs: Array<Song>
    usersMap: Record<string, any>
    songsLoading: boolean
    songsError: Error | null
    onRetrySongs: () => void
}

export function SongList({ songs, usersMap, songsLoading, songsError, onRetrySongs }: SongListProps) {
    return (
        <div className="p-3 sm:p-4">
            {songsError && (
                <Alert variant="destructive" className="mb-4">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Failed to load songs</AlertTitle>
                    <AlertDescription>
                        Unable to load songs. Please check your connection and try again.
                    </AlertDescription>
                    <Button
                        onClick={onRetrySongs}
                        variant="outline"
                        size="sm"
                        className="mt-2"
                    >
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Retry
                    </Button>
                </Alert>
            )}

            <div className="flex items-center gap-2 mb-4">
                <Music className="h-4 w-4 sm:h-5 sm:w-5" />
                <h2 className="text-lg sm:text-xl font-semibold">Song Playlist</h2>
            </div>

            {songsLoading ? (
                // Loading skeletons for playlist
                <div className="space-y-2 sm:space-y-3">
                    {Array.from({ length: 8 }).map((_, i) => (
                        <div key={i} className="flex items-center space-x-2 sm:space-x-4 p-2 sm:p-3 rounded-lg border">
                            <Skeleton className="w-10 h-10 sm:w-12 sm:h-12 rounded" />
                            <div className="flex-1 space-y-2">
                                <Skeleton className="h-3 sm:h-4 w-3/4" />
                                <Skeleton className="h-2 sm:h-3 w-1/2" />
                            </div>
                            <Skeleton className="w-6 h-6 sm:w-8 sm:h-8 rounded-full" />
                            <Skeleton className="h-2 sm:h-3 w-12 sm:w-16" />
                        </div>
                    ))}
                </div>
            ) : songs.length > 0 ? (
                <div className="space-y-1 sm:space-y-2">
                    {songs.map((song, index) => {
                        const songPlatform = song.platform || getPlatform(song.url)
                        const thumbnail = getThumbnail(song.url, songPlatform)
                        const title = song.title || song.url
                        const songUser = usersMap[song.userId]

                        return (
                            <div
                                key={song.id}
                                className="flex items-center space-x-2 sm:space-x-4 p-2 sm:p-3 rounded-lg hover:bg-zinc-800 transition-colors border-b border-zinc-800 last:border-b-0"
                            >
                                {/* Track number - hidden on very small screens */}
                                <div className="hidden sm:block w-6 sm:w-8 text-center text-xs sm:text-sm text-muted-foreground font-mono flex-shrink-0">
                                    {index + 1}
                                </div>

                                {/* Thumbnail */}
                                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded overflow-hidden bg-zinc-800 flex-shrink-0">
                                    {thumbnail ? (
                                        <Image
                                            src={thumbnail}
                                            alt="Song thumbnail"
                                            width={48}
                                            height={48}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <Music className="h-4 w-4 sm:h-6 sm:w-6 text-gray-400" />
                                        </div>
                                    )}
                                </div>

                                {/* Song info */}
                                <div className="flex-1 min-w-0">
                                    <a
                                        href={song.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-xs sm:text-sm font-medium text-gray-100 hover:text-blue-400 block truncate"
                                    >
                                        {title}
                                    </a>
                                    <div className="flex items-center space-x-2 text-xs text-muted-foreground mt-0.5">
                                        <span className="px-1.5 sm:px-2 py-0.5 sm:py-1 bg-zinc-800 rounded text-xs">
                                            {songPlatform}
                                        </span>
                                    </div>
                                </div>

                                {/* User info - simplified on mobile */}
                                <div className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0">
                                    {songUser?.avatar ? (
                                        <Image
                                            src={`https://cdn.discordapp.com/avatars/${songUser.id}/${songUser.avatar}.png`}
                                            alt="User avatar"
                                            width={24}
                                            height={24}
                                            className="w-5 h-5 sm:w-6 sm:h-6 rounded-full"
                                        />
                                    ) : (
                                        <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-zinc-800 flex items-center justify-center">
                                            <User className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-gray-400" />
                                        </div>
                                    )}
                                    <span className="text-xs text-muted-foreground hidden md:inline">
                                        {songUser?.username || <Skeleton className="h-2 sm:h-3 w-12 sm:w-16" />}
                                    </span>
                                </div>

                                {/* Play button */}
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    className="flex-shrink-0 p-1 sm:p-2"
                                    asChild
                                >
                                    <a
                                        href={song.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        <Play className="h-3 w-3 sm:h-4 sm:w-4" />
                                    </a>
                                </Button>
                            </div>
                        )
                    })}
                </div>
            ) : (
                <div className="text-center py-8 sm:py-12">
                    <Music className="h-10 w-10 sm:h-12 sm:w-12 text-gray-400 mx-auto mb-3 sm:mb-4" />
                    <p className="text-sm sm:text-base text-muted-foreground">No songs in your playlist yet.</p>
                    <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                        Songs shared in your Discord server will appear here.
                    </p>
                </div>
            )}
        </div>
    )
}