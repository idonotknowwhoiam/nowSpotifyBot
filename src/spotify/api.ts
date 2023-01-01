import { logger } from '@/logger'
import { refreshToken } from '@/spotify/auth'
import {
    ApiError,
    CurrentlyTrack,
    RecentlyTracks,
    Track
} from '@/spotify/types'
import { User } from '@prisma/client'

const API_URL = 'https://api.spotify.com/v1'

const spotifyRequest = async <T>(url: string, user: User) => {
    logger.debug(`@spotifyRequest/${url} from ${user.userId}`)

    const responseRaw = await fetch(url, {
        method: 'GET',
        headers: {
            Authorization: 'Bearer ' + user.accessToken,
            'Content-Type': 'application/json'
        }
    })

    if (responseRaw.status === 204)
        throw new Error(`There aren't any data, status ${responseRaw.status}`)

    const response = (await responseRaw.json()) as T | ApiError

    // @ts-ignore
    if ('error' in response) {
        if (response.error?.status == 401) {
            const updatedUser = await refreshToken(user)

            if ('error' in updatedUser) {
                throw new Error('Cannot refresh token, try to login again.')
            }

            const response = (await spotifyRequest(url, updatedUser)) as T
            return response
        }

        return response
    }

    return response
}

export const getCurrentlyPlayed = async (user: User) => {
    const track = await spotifyRequest<CurrentlyTrack>(
        `${API_URL}/me/player/currently-playing`,
        user
    ).catch((err: Error) => {
        logger.error(`getCurrentlyPlayed, ${err.message}`)
        return {
            error: {
                status: 204,
                message: "You're not playing music right now."
            }
        } as ApiError
    })

    return track
}

export const getRecentlyPlayed = async (user: User, limit: number) => {
    const tracks = await spotifyRequest<RecentlyTracks>(
        `${API_URL}/me/player/recently-played?limit=${limit}`,
        user
    )

    if ('error' in tracks) {
        return tracks
    }

    return tracks.items.map((item) => item.track)
}

export const getTrack = async (user: User, id: string) => {
    const track = await spotifyRequest<Track>(`${API_URL}/tracks/${id}`, user)

    return track
}
