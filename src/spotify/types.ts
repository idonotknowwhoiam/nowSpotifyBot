export type Credentials = {
    access_token: string
    refresh_token: string
    token_type: string
    scope: string
    expires_in: number
}

export type RefreshedToken = {
    access_token: string
    token_type: string
    scope: string
    expires_in: number
}

export type AuthError = {
    error: string
    error_description: string
}

export type ApiError = {
    error: { status: number; message: string }
}

export type Track = {
    album: object
    artists: { name: string }[]
    available_markets: string[]
    disc_number: number
    duration_ms: number
    uri: string
    name: string
}

export type CurrentlyTrack = {
    item: Track
    is_playing: boolean
}

export type RecentlyTracks = {
    items: { track: Track }[]
}
