import { logger } from '@/logger'

const songlinkURL = 'https://api.song.link/v1-alpha.1/links'

export const getSonglink = async (spotifyUri: string) => {
    const res = await fetch(
        `${songlinkURL}?url=${encodeURIComponent(spotifyUri)}&userCountry=RU`
    )

    const result = await res.json()
    logger.trace(`Songlink for ${spotifyUri}`)
    return result.linksByPlatform
}
