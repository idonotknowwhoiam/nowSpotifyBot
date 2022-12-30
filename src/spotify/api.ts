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
    console.log(`@spotifyRequest/${url}`)

    const responseRaw = await fetch(url, {
        method: 'GET',
        headers: {
            Authorization: 'Bearer ' + user.accessToken,
            'Content-Type': 'application/json'
        }
    })

    const response = (await responseRaw.json()) as T | ApiError

    // @ts-ignore
    if ('error' in response) {
        if (response.error?.status == 401) {
            const updatedUser = await refreshToken(user)

            if ('error' in updatedUser) {
                throw new Error('Cannot refresh token')
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
    )

    return track
}

export const getRecentlyPlayed = async (user: User) => {
    const tracks = await spotifyRequest<RecentlyTracks>(
        `${API_URL}/me/player/recently-played?limit=1`,
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
