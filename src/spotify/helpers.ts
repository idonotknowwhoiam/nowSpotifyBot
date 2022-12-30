import querystring from 'node:querystring'
import { env } from '../config'

export const generateAccessLink = (state: string) => {
    const url = 'https://accounts.spotify.com/authorize?'

    const query = querystring.stringify({
        response_type: 'code',
        client_id: env.CLIENT_ID,
        scope: env.scope,
        redirect_uri: env.redirect_uri,
        state: state
    })

    return url + query
}
