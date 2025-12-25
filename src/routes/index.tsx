import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useMutation, useQueries, useQuery } from '@tanstack/react-query'
import { useEffect, useMemo } from 'react'
import { Image } from '@unpic/react'
import { AlertTriangle, RefreshCw } from 'lucide-react'
import type { Song } from '@/data/types'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'
import { getPlatform, getThumbnail, getTitle } from '@/lib/songUtils'
import { getCurrentUser } from '@/lib/auth'
import { getSongs } from '@/data/songs'
import { getUserById } from '@/data/users'

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

  const songsByPlatform = useMemo(() => {
    const grouped: Record<string, Array<Song>> = {}
    songs.forEach((song) => {
      const platform = song.platform || getPlatform(song.url)
      grouped[platform] ??= []
      grouped[platform].push(song)
    })
    return grouped
  }, [songs])

  // Fetch titles for all songs
  const titleQueries = useQueries({
    queries: songs.map((song) => ({
      queryKey: ['song-title', song.id],
      queryFn: () => getTitle(song.url, song.platform || getPlatform(song.url)),
      staleTime: 1000 * 60 * 60, // 1 hour
    })),
  })

  const titlesMap = useMemo(() => {
    const map: Record<number, string> = {}
    songs.forEach((song, index) => {
      map[song.id] = titleQueries[index]?.data || song.url
    })
    return map
  }, [songs, titleQueries])

  // Fetch users for all unique userIds
  const uniqueUserIds = useMemo(
    () => [...new Set(songs.map((s) => s.userId))],
    [songs],
  )
  const userQueries = useQueries({
    queries: uniqueUserIds.map((userId) => ({
      queryKey: ['user', userId],
      queryFn: () => getUserById({ data: userId }),
      staleTime: 1000 * 60 * 60, // 1 hour
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

  useEffect(() => {
    if (!userLoading && !user) {
      navigate({ to: '/login' })
    }
  }, [user, userLoading, navigate])

  const handleLogout = () => {
    logoutMutation.mutate()
  }

  const handleRetryUser = () => {
    refetchUser()
  }

  const handleRetrySongs = () => {
    refetchSongs()
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {userError && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Failed to load user</AlertTitle>
            <AlertDescription>
              Unable to load user information. Please check your connection and
              try again.
            </AlertDescription>
            <Button
              onClick={handleRetryUser}
              variant="outline"
              size="sm"
              className="mt-2"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </Alert>
        )}

        <Card className="w-full max-w-md mx-auto">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Minstrel</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            {userLoading ? (
              <div className="space-y-4">
                <Skeleton className="w-16 h-16 rounded-full mx-auto" />
                <Skeleton className="h-6 w-32 mx-auto" />
                <Skeleton className="h-4 w-48 mx-auto" />
              </div>
            ) : user ? (
              <div>
                {user.avatar && (
                  <Image
                    src={`https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`}
                    alt="Avatar"
                    width={64}
                    height={64}
                    className="w-16 h-16 rounded-full mx-auto mb-2"
                  />
                )}
                <p className="text-lg font-semibold">
                  Welcome, {user.username}!
                </p>
                <p className="text-sm text-muted-foreground">
                  You are verified and in the guild.
                </p>
              </div>
            ) : null}
            {user && (
              <Button onClick={handleLogout} variant="destructive">
                Logout
              </Button>
            )}
          </CardContent>
        </Card>

        {songsError && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Failed to load songs</AlertTitle>
            <AlertDescription>
              Unable to load songs. Please check your connection and try again.
            </AlertDescription>
            <Button
              onClick={handleRetrySongs}
              variant="outline"
              size="sm"
              className="mt-2"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </Alert>
        )}

        <div className="space-y-6">
          {songsLoading ? (
            // Loading skeletons for songs
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-24" />
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <Card key={i} className="overflow-hidden">
                      <CardContent className="p-4">
                        <Skeleton className="w-full h-32 mb-2" />
                        <Skeleton className="h-4 w-full mb-2" />
                        <div className="flex items-center space-x-2">
                          <Skeleton className="w-6 h-6 rounded-full" />
                          <Skeleton className="h-3 w-20" />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : Object.keys(songsByPlatform).length > 0 ? (
            Object.entries(songsByPlatform).map(([platform, platformSongs]) => (
              <Card key={platform}>
                <CardHeader>
                  <CardTitle>{platform}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {platformSongs.map((song) => {
                      const songPlatform =
                        song.platform || getPlatform(song.url)
                      const thumbnail = getThumbnail(song.url, songPlatform)
                      const title = titlesMap[song.id] || (
                        <Skeleton className="h-4 w-full" />
                      )
                      const songUser = usersMap[song.userId]
                      return (
                        <Card key={song.id} className="overflow-hidden">
                          <CardContent className="p-4">
                            {thumbnail ? (
                              <Image
                                src={thumbnail}
                                alt="Song thumbnail"
                                width={320}
                                height={180}
                                className="w-full object-cover rounded mb-2"
                              />
                            ) : (
                              <Skeleton className="w-full h-32 mb-2" />
                            )}
                            <a
                              href={song.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline text-sm break-all block mb-2 font-medium"
                            >
                              {typeof title === 'string' ? title : title}
                            </a>
                            <div className="flex items-center space-x-2">
                              {songUser?.avatar ? (
                                <Image
                                  src={`https://cdn.discordapp.com/avatars/${songUser.id}/${songUser.avatar}.png`}
                                  alt="User avatar"
                                  width={24}
                                  height={24}
                                  className="w-6 h-6 rounded-full"
                                />
                              ) : (
                                <Skeleton className="w-6 h-6 rounded-full" />
                              )}
                              <span className="text-xs text-muted-foreground">
                                {songUser?.username || (
                                  <Skeleton className="h-3 w-20 inline-block" />
                                )}
                              </span>
                            </div>
                          </CardContent>
                        </Card>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-muted-foreground">No songs found.</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
