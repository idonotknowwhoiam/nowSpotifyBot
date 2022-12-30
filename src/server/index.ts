import { env } from '@/config'
import { createUser } from '@/db/helpers'
import { swapTokens } from '@/spotify/auth'
import Fastify, { FastifyInstance, RouteShorthandOptions } from 'fastify'

const server: FastifyInstance = Fastify({})

interface IQuerystring {
    code: string
    state: string
}

server.get<{ Querystring: IQuerystring }>('/callback', async (request) => {
    const credentials = await swapTokens(request.query.code)

    if ('access_token' in credentials) {
        try {
            await createUser(
                request.query.state,
                credentials.access_token,
                credentials.refresh_token
            )

            server.log.info('User with access token created')

            return 'Access token successfully linked'
        } catch (err) {
            server.log.error('Error while creating user', err)
            return 'Error while creating user'
        }
    }

    server.log.error('Access token invalid', credentials.error_description)

    return credentials.error_description
})

const start = async () => {
    try {
        await server.listen({ port: 3000 })

        const address = server.server.address()
        const port = typeof address === 'string' ? address : address?.port
        console.log(`Server started on ${port} port`)
    } catch (err) {
        server.log.error(err)
        process.exit(1)
    }
}

start()
