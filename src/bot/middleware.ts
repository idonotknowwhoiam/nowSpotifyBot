import { bot } from '@/bot'
import { composeMessage, handleError } from '@/bot/helpers'
import { getUser } from '@/db/helpers'
import { getSonglink } from '@/songlink'
import { getTrack } from '@/spotify/api'
import { splitUriToId } from '@/spotify/helpers'
import { Context, NextFunction } from 'grammy'

export async function editInline(ctx: Context, next: NextFunction): Promise<void> {
    if (ctx.chosenInlineResult) {
        if (ctx.chosenInlineResult.result_id === 'error') return

        try {
            if (!ctx.from) throw new Error()

            const user = await getUser(ctx.from?.id)
            if (!user) throw new Error('Unexpected error, please login to spotify again.')

            const track = await getTrack(
                user,
                splitUriToId(ctx.chosenInlineResult.result_id)
            )
            if ('error' in track) throw new Error(track.error.message)

            const links = await getSonglink(ctx.chosenInlineResult?.result_id)

            await bot.api.raw.editMessageText({
                inline_message_id: ctx.chosenInlineResult?.inline_message_id,
                text: composeMessage(links, `${track.artists[0]?.name} - ${track.name}`),
                disable_web_page_preview: true,
                parse_mode: 'HTML'
            })
        } catch (err: any) {
            handleError(err.message, ctx)
        }
    }

    await next()
}
