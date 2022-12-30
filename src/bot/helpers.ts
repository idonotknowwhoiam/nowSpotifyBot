import { modifiedTrack } from '@/bot/types'
import { Track } from '@/spotify/types'
import { Context } from 'grammy'

const streamings = [
    { title: 'Apple', id: 'appleMusic' },
    { title: 'YM', id: 'yandex' },
    { title: 'YouTube', id: 'youtube' },
    { title: 'Spotify', id: 'spotify' }
]

export const modifyTracksArray = (tracks: Track[]) => {
    const modifiedTracks: modifiedTrack[] = tracks.map((track) => {
        return {
            title: `${track.artists[0]?.name} - ${track.name}`,
            uri: track.uri
        }
    })

    return modifiedTracks
}

export const dedupeTracks = (tracks: modifiedTrack[]) => {
    const uniqueUris: string[] = []

    const droppedArray = tracks.filter((track) => {
        const isDuplicate = uniqueUris.includes(track.uri)

        if (!isDuplicate) {
            uniqueUris.push(track.uri)

            return true
        }

        return false
    })

    console.log(droppedArray)

    return droppedArray
}

export const composeMessage = (songLinks: any, title: string) => {
    const links = streamings.reduce((accumulator, service) => {
        return songLinks[service.id]
            ? accumulator +
                  `<a href="${songLinks[service.id].url}">${
                      service.title
                  }</a>` +
                  '  '
            : accumulator
    }, '')

    return `${title}

${links}
    `
}

export const handleError = (message: string | undefined, ctx: Context) =>
    ctx.reply(message ?? 'Unexpected error, try again.')
