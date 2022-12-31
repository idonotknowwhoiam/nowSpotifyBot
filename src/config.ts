import 'dotenv/config'
import { cleanEnv, str } from 'envalid'

export const env = cleanEnv(process.env, {
    CLIENT_ID: str(),
    CLIENT_SECRET: str(),
    TELEGRAM_SECRET: str(),
    NODE_ENV: str({
        choices: ['production', 'development'],
        default: 'development'
    }),
    LOG_LEVEL: str({
        choices: [
            'fatal',
            'error',
            'warn',
            'info',
            'debug',
            'trace',
            'silent'
        ],
        default: 'debug'
    }),
    API: str(),
    scope: str(),
    redirect_uri: str()
})
