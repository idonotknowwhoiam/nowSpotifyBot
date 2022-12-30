import { dedupeTracks, handleError, modifyTracksArray } from '@/bot/helpers'
import { editInline } from '@/bot/middleware'
import { env } from '@/config'
import { getUser } from '@/db/helpers'
import { logger } from '@/logger'
import { getCurrentlyPlayed, getRecentlyPlayed } from '@/spotify/api'
import { generateAccessLink } from '@/spotify/helpers'
import { apiThrottler } from '@grammyjs/transformer-throttler'
import { Bot, GrammyError, HttpError, InlineKeyboard } from 'grammy'
import { InlineQueryResultAudio } from 'grammy/types'

const throttler = apiThrottler()

export const bot = new Bot(env.TELEGRAM_SECRET)
bot.api.config.use(throttler)
bot.use(editInline)

const inlineKeyboard = new InlineKeyboard().text('Loading...', 'loading')

bot.command(['start', 'login'], async (ctx) => {
    if (!ctx.from) throw new Error()

    const accessLink = generateAccessLink(ctx.from?.id.toString())
    ctx.reply(
        'Hi, to use bot you need to authorize it in Spotify. Follow the link. \n\n' +
            accessLink
    )
})

bot.command('now', async (ctx) => {
    try {
        if (!ctx.from) throw new Error()

        const user = await getUser(ctx.from?.id)
        if (!user)
            throw new Error('Unexpected error, please login to spotify again.')

        const now = await getCurrentlyPlayed(user)
        if ('error' in now) throw new Error(now.error.message)

        return ctx.reply(now.item.name)
    } catch (err: any) {
        logger.error(err.message)
        return handleError(err.message, ctx)
    }
})

bot.on('inline_query', async (ctx) => {
    try {
        const user = await getUser(ctx.from?.id)
        if (!user)
            throw new Error('Unexpected error, please login to spotify again.')

        const recentlyTracks = await getRecentlyPlayed(user, 2)
        if ('error' in recentlyTracks)
            throw new Error(recentlyTracks.error.message)

        const currentlyTrack = await await getCurrentlyPlayed(user)
        if ('error' in currentlyTrack)
            throw new Error(currentlyTrack.error.message)

        const tracks = dedupeTracks(
            modifyTracksArray([currentlyTrack.item, ...recentlyTracks])
        )

        const results = tracks.map((track): InlineQueryResultAudio => {
            return {
                type: 'audio',
                audio_url: 'https://example.com',
                id: track.uri,
                title: track.title,
                input_message_content: {
                    message_text: track.title,
                    parse_mode: 'HTML',
                    disable_web_page_preview: true
                },
                reply_markup: inlineKeyboard
            }
        })

        return await ctx.answerInlineQuery(results, {
            cache_time: 1
        })
    } catch (err: any) {
        logger.error(err.message)
        return handleError(err.message, ctx)
    }
})

bot.start()
logger.info('Bot started')

bot.catch((err) => {
    const ctx = err.ctx
    logger.error(`Error while handling update ${ctx.update.update_id}:`)
    const e = err.error
    if (e instanceof GrammyError) {
        logger.error('Error in request:', e.description)
    } else if (e instanceof HttpError) {
        logger.error('Could not contact Telegram:', e)
    } else {
        logger.error('Unknown error:', e)
    }
})
