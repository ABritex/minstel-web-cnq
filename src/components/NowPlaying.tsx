import { Image } from '@unpic/react'
import { Music } from 'lucide-react'
import type { Song } from '@/data/types'

interface NowPlayingProps {
    currentSong: Song | null
    currentTitle: string
    currentThumbnail: string | null
    currentSongIndex: number | null
    songsLength: number
}

export function NowPlaying({
    currentSong,
    currentTitle,
    currentThumbnail,
    currentSongIndex,
    songsLength,
}: NowPlayingProps) {
    if (!currentSong) return null

    return (
        <div className="p-6 lg:p-12 flex flex-col items-center justify-center h-full">
            {/* Album art */}
            <div className="w-full max-w-sm lg:max-w-md aspect-square mb-6 lg:mb-8 rounded-lg shadow-2xl overflow-hidden bg-zinc-800">
                {currentThumbnail ? (
                    <Image
                        src={currentThumbnail}
                        alt="Current song"
                        width={400}
                        height={400}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <Music className="h-24 lg:h-32 w-24 lg:w-32 text-zinc-600" />
                    </div>
                )}
            </div>

            {/* Song info */}
            <div className="w-full text-center">
                <h2 className="text-2xl lg:text-3xl font-bold mb-2 truncate px-4">{currentTitle}</h2>
                <p className="text-zinc-400 text-sm lg:text-base">Track {currentSongIndex! + 1} of {songsLength}</p>
            </div>
        </div>
    )
}