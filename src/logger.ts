import { env } from '@/config'
import pino, { destination, Logger, LoggerOptions } from 'pino'

const options: LoggerOptions = {
    level: env.LOG_LEVEL
}

const transport = pino.transport({
    targets: [
        {
            level: env.NODE_ENV === 'production' ? 'silent' : 'info',
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
