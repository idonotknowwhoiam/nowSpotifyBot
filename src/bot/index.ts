import { dedupeTracks, handleError, modifyTracksArray } from '@/bot/helpers'
import { editInline } from '@/bot/middleware'
import { env } from '@/config'
import { getUser } from '@/db/helpers'
import { logger } from '@/logger'
import { getCurrentlyPlayed, getRecentlyPlayed } from '@/spotify/api'
import { generateAccessLink } from '@/spotify/helpers'
import { autoRetry } from '@grammyjs/auto-retry'
import { apiThrottler } from '@grammyjs/transformer-throttler'
import { Bot, GrammyError, HttpError, InlineKeyboard } from 'grammy'
import { InlineQueryResultAudio } from 'grammy/types'

const throttler = apiThrottler()

export const bot = new Bot(env.TELEGRAM_SECRET)
bot.api.config.use(throttler)
bot.api.config.use(autoRetry())
bot.use(editInline)

const loader = new InlineKeyboard().text('Loading...', 'loading')

bot.command(['start', 'login'], async (ctx) => {
    if (!ctx.from) throw new Error()

    const accessLink = generateAccessLink(ctx.from?.id.toString())

    ctx.reply('Hi, to use bot you need to authorize it in Spotify.', {
        reply_markup: new InlineKeyboard().url('Login to Spotify', accessLink)
    })
})

bot.command('now', async (ctx) => {
    try {
        if (!ctx.from) throw new Error()

        const user = await getUser(ctx.from?.id)
        if (!user) return handleError('You are not logged in Spotify.', ctx)

        const now = await getCurrentlyPlayed(user)
        if ('error' in now) return handleError(now.error.message, ctx)

        return ctx.reply(`${now.item.artists[0]?.name} - ${now.item.name}`)
    } catch (err: any) {
        logger.error(err.message)
        return handleError(err.message, ctx)
    }
})

bot.on('inline_query', async (ctx) => {
    try {
        const user = await getUser(ctx.from?.id)
        if (!user) return handleError('You are not logged in Spotify.', ctx)

        const recentlyTracks = await getRecentlyPlayed(user, 2)
        if ('error' in recentlyTracks)
            return handleError(recentlyTracks.error.message, ctx)

        const currentlyTrack = await getCurrentlyPlayed(user)

        const isCurrentlyTrackExists = 'item' in currentlyTrack

        const tracks = isCurrentlyTrackExists
            ? dedupeTracks(modifyTracksArray([currentlyTrack.item, ...recentlyTracks]))
            : dedupeTracks(modifyTracksArray(recentlyTracks))

        const results = tracks.map((track): InlineQueryResultAudio => {
            return {
                type: 'audio',
                audio_url: 'https://example.com',
                id: track.uri,
                title: track.title,
                performer: track.performer,
                input_message_content: {
                    message_text: `${track.performer} - ${track.title}`,
                    parse_mode: 'HTML',
                    disable_web_page_preview: true
                },
                reply_markup: loader
            }
        })

        return await ctx.answerInlineQuery(results, {
            cache_time: 0
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

