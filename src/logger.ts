import { env } from '@/config'
import pino, { destination, Logger, LoggerOptions } from 'pino'

const transport = pino.transport({
    targets: [
        {
            level: env.NODE_ENV === 'production' ? 'info' : env.LOG_LEVEL,
            target: 'pino-pretty',
            options: {}
        },
        {
            level: env.NODE_ENV === 'production' ? 'trace' : 'silent',
            target: 'pino/file',
            options: { destination: 'logs/log', mkdir: true }
        }
    ]
})

export const logger = pino(transport)
