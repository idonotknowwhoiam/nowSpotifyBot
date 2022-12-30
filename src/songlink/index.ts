const songlinkURL = 'https://api.song.link/v1-alpha.1/links'

export const getSonglink = async (spotifyUri: string) => {
    console.log('uri', spotifyUri)
    const res = await fetch(
        `${songlinkURL}?url=${encodeURIComponent(spotifyUri)}&userCountry=RU`
    )

    const result = await res.json()
    console.log('rdy')
    return result.linksByPlatform
}
