import { modifiedTrack } from '@/bot/types'
import { logger } from '@/logger'
import { Track } from '@/spotify/types'
import { Context } from 'grammy'

const streamings = [
    { title: 'Apple', id: 'appleMusic' },
    { title: 'YM', id: 'yandex' },
    { title: 'YouTube', id: 'youtube' },
    { title: 'Spotify', id: 'spotify' }
]

export const modifyTracksArray = (tracks: Track[]) => {
    const modifiedTracks = tracks.map((track) => {
        return {
            title: track.name,
            performer: track.artists[0]?.name,
            uri: track.uri
        } as modifiedTrack
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

        logger.trace('Duplicate was found and deleted.')
        return false
    })

    return droppedArray
}

export const composeMessage = (songLinks: any, title: string) => {
    const links = streamings.reduce((accumulator, service) => {
        return songLinks[service.id]
            ? accumulator +
                  `<a href="${songLinks[service.id].url}">${service.title}</a>` +
                  '  '
            : accumulator
    }, '')

    return `${title}

${links}
    `
}

export const handleError = (
    message: string | undefined = 'Unexpected Error',
    ctx: Context
) => {
    if (ctx.inlineQuery) {
        return inlineError(message, ctx)
    }

    return ctx.reply(message)
}

export const inlineError = async (message: string, ctx: Context) => {
    return await ctx.answerInlineQuery(
        [
            {
                type: 'article',
                id: 'error',
                title: 'Error',
                input_message_content: {
                    message_text: message,
                    disable_web_page_preview: true
                },
                description: message
            }
        ],
        {
            cache_time: 5
        }
    )
}
