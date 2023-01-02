import { logger } from '@/logger'
import { Prisma, PrismaClient } from '@prisma/client'

export const prisma = new PrismaClient({
    log: [
        {
            emit: 'event',
            level: 'error'
        },
        {
            emit: 'event',
            level: 'info'
        },
        {
            emit: 'event',
            level: 'warn'
        }
    ]
})

prisma.$on('warn', (e: Prisma.LogEvent) => {
    logger.warn({
        msg: 'database warning',
        target: e.target,
        message: e.message
    })
})

prisma.$on('error', (e: Prisma.LogEvent) => {
    logger.error({
        msg: 'database error',
        target: e.target,
        message: e.message
    })
})
