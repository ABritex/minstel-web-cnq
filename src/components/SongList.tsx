import { Image } from '@unpic/react'
import { AlertTriangle, RefreshCw, Play, Music, User } from 'lucide-react'
import type { Song } from '@/data/types'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'
import { getPlatform, getThumbnail } from '@/lib/songUtils'

interface SongListProps {
    songs: Song[]
    titlesMap: Record<number, string>
    usersMap: Record<string, any>
    songsLoading: boolean
    songsError: Error | null
    onRetrySongs: () => void
}

export function SongList({ songs, titlesMap, usersMap, songsLoading, songsError, onRetrySongs }: SongListProps) {
    return (
        <>
            {songsError && (
                <Alert variant="destructive">
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
                <Music className="h-5 w-5" />
                <h2 className="text-xl font-semibold">Song Playlist</h2>
            </div>

            {songsLoading ? (
                // Loading skeletons for playlist
                <div className="space-y-3">
                    {Array.from({ length: 8 }).map((_, i) => (
                        <div key={i} className="flex items-center space-x-4 p-3 rounded-lg border">
                            <Skeleton className="w-12 h-12 rounded" />
                            <div className="flex-1 space-y-2">
                                <Skeleton className="h-4 w-3/4" />
                                <Skeleton className="h-3 w-1/2" />
                            </div>
                            <Skeleton className="w-8 h-8 rounded-full" />
                            <Skeleton className="h-3 w-16" />
                        </div>
                    ))}
                </div>
            ) : songs.length > 0 ? (
                <div className="space-y-2 overflow-y-auto flex-1">
                    {songs.map((song, index) => {
                        const songPlatform = song.platform || getPlatform(song.url)
                        const thumbnail = getThumbnail(song.url, songPlatform)
                        const title = titlesMap[song.id] || song.url
                        const songUser = usersMap[song.userId]

                        return (
                            <div
                                key={song.id}
                                className="flex items-center space-x-4 p-3 rounded-lg hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0"
                            >
                                {/* Track number */}
                                <div className="w-8 text-center text-sm text-muted-foreground font-mono">
                                    {index + 1}
                                </div>

                                {/* Thumbnail */}
                                <div className="w-12 h-12 rounded overflow-hidden bg-gray-200 flex-shrink-0">
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
                                            <Music className="h-6 w-6 text-gray-400" />
                                        </div>
                                    )}
                                </div>

                                {/* Song info */}
                                <div className="flex-1 min-w-0">
                                    <a
                                        href={song.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-sm font-medium text-gray-900 hover:text-blue-600 block truncate"
                                    >
                                        {typeof title === 'string' ? title : <Skeleton className="h-4 w-full" />}
                                    </a>
                                    <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                                        <span className="px-2 py-1 bg-gray-100 rounded text-xs">
                                            {songPlatform}
                                        </span>
                                    </div>
                                </div>

                                {/* User info */}
                                <div className="flex items-center space-x-2 flex-shrink-0">
                                    {songUser?.avatar ? (
                                        <Image
                                            src={`https://cdn.discordapp.com/avatars/${songUser.id}/${songUser.avatar}.png`}
                                            alt="User avatar"
                                            width={24}
                                            height={24}
                                            className="w-6 h-6 rounded-full"
                                        />
                                    ) : (
                                        <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center">
                                            <User className="h-3 w-3 text-gray-400" />
                                        </div>
                                    )}
                                    <span className="text-xs text-muted-foreground hidden sm:inline">
                                        {songUser?.username || <Skeleton className="h-3 w-16" />}
                                    </span>
                                </div>

                                {/* Play button */}
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    className="flex-shrink-0"
                                    asChild
                                >
                                    <a
                                        href={song.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        <Play className="h-4 w-4" />
                                    </a>
                                </Button>
                            </div>
                        )
                    })}
                </div>
            ) : (
                <div className="text-center py-12 flex-1 flex items-center justify-center">
                    <div>
                        <Music className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-muted-foreground">No songs in your playlist yet.</p>
                        <p className="text-sm text-muted-foreground mt-1">
                            Songs shared in your Discord server will appear here.
                        </p>
                    </div>
                </div>
            )}
        </>
    )
}