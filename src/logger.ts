import { env } from '@/config'
import pino from 'pino'

const isProd = env.NODE_ENV === 'production'

const transport = pino.transport({
    targets: [
        {
            level: isProd ? 'info' : 'trace',
            target: 'pino-pretty',
            options: {
                ignore: 'pid,hostname',
                colorize: true,
                minimumLevel: 'trace'
            }
        },
        {
            level: isProd ? 'info' : 'silent',
            target: 'pino/file',
            options: { destination: 'logs/log', mkdir: true }
        }
    ]
})

export const logger = pino({ level: isProd ? 'info' : 'trace' }, transport)
