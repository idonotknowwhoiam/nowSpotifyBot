import { env } from '@/config'
import { updateAccessToken } from '@/db/helpers'
import { AuthError, Credentials, RefreshedToken } from '@/spotify/types'
import { User } from '@prisma/client'

const AUTH_URL = 'https://accounts.spotify.com/api/token'

export const swapTokens = async (code: string) => {
    console.log('@swapTokens')

    const headers = {
        Authorization: 'Basic ' + btoa(`${env.CLIENT_ID}:${env.CLIENT_SECRET}`),
        'Content-Type': 'application/x-www-form-urlencoded'
    }

    const credentialsRaw = await fetch(AUTH_URL, {
        method: 'POST',
        headers: headers,
        body: `grant_type=authorization_code&redirect_uri=${env.redirect_uri}&code=${code}`
    })

    const credentials = (await credentialsRaw.json()) as Credentials | AuthError

    return credentials
}

export const refreshToken = async (user: User) => {
    console.log('@refreshToken')

    const headers = {
        Authorization: 'Basic ' + btoa(`${env.CLIENT_ID}:${env.CLIENT_SECRET}`),
        'Content-Type': 'application/x-www-form-urlencoded'
    }

    const refreshedTokenRaw = await fetch(AUTH_URL, {
        method: 'POST',
        headers: headers,
        body: `grant_type=refresh_token&refresh_token=${user?.refreshToken}`
    })

    const refreshedToken = (await refreshedTokenRaw.json()) as
        | RefreshedToken
        | AuthError

    if ('error' in refreshedToken) return refreshedToken

    const updatedUser = await updateAccessToken(
        user.userId,
        refreshedToken.access_token
    )

    return updatedUser
}
