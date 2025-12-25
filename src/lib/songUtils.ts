export const getPlatform = (url: string) => {
  if (url.includes('music.youtube.com')) return 'YouTube Music'
  if (url.includes('youtube.com') || url.includes('youtu.be')) return 'YouTube'
  if (url.includes('open.spotify.com')) return 'Spotify'
  if (url.includes('soundcloud.com')) return 'SoundCloud'
  if (url.includes('music.apple.com')) return 'Apple Music'
  return 'Unknown'
}

export const getThumbnail = (url: string, platform: string | null) => {
  if (platform === 'YouTube' || platform === 'YouTube Music') {
    const match = url.match(
      /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/,
    )
    if (match) {
      return `https://img.youtube.com/vi/${match[1]}/maxresdefault.jpg`
    }
  }
  return null
}

export const getTitle = async (url: string, platform: string | null) => {
  try {
    if (platform === 'YouTube' || platform === 'YouTube Music') {
      const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`
      const res = await fetch(oembedUrl)
      if (res.ok) {
        const data = await res.json()
        return data.title
      }
    }
    // For other platforms, could add oEmbed if available
    return url // fallback to URL
  } catch {
    return url
  }
}
