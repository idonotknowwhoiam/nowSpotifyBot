import 'dotenv/config'
import { cleanEnv, str } from 'envalid'

export const env = cleanEnv(process.env, {
    CLIENT_ID: str(),
    CLIENT_SECRET: str(),
    TELEGRAM_SECRET: str(),
    API: str(),
    scope: str(),
    redirect_uri: str()
})
