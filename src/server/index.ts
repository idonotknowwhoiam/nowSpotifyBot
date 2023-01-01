import { createUser } from '@/db/helpers'
import { logger } from '@/logger'
import { swapTokens } from '@/spotify/auth'
import Fastify, { FastifyInstance } from 'fastify'

const server: FastifyInstance = Fastify({})

interface IQuerystring {
    code: string
    state: string
}

server.get<{ Querystring: IQuerystring }>('/callback', async (request) => {
    const credentials = await swapTokens(request.query.code)

    if ('access_token' in credentials) {
        try {
            const user = await createUser(
                request.query.state,
                credentials.access_token,
                credentials.refresh_token
            )

            logger.info(`User ${user.userId} with access token created`)

            return 'Access token successfully linked, back to bot'
        } catch (err) {
            logger.error('Error while creating user', err)
            return 'Error while creating user'
        }
    }

    logger.error(
        `Access token invalid for ${request.query.state}`,
        credentials.error_description
    )

    return credentials.error_description
})

const start = async () => {
    try {
        await server.listen({ port: 3000, host: '0.0.0.0' })

        const address = server.server.address()
        const port = typeof address === 'string' ? address : address?.port
        logger.info(`Server started on ${port} port`)
    } catch (err) {
        logger.error(err)
        process.exit(1)
    }
}

start()
