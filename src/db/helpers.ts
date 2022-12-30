import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export const createUser = async (
    userId: string,
    accessToken: string,
    refreshToken: string
) => {
    return await prisma.user.upsert({
        update: {
            accessToken,
            refreshToken
        },

        where: {
            userId
        },

        create: {
            userId,
            accessToken,
            refreshToken
        }
    })
}

export const updateAccessToken = async (
    userId: string,
    accessToken: string
) => {
    return await prisma.user.update({
        where: {
            userId
        },
        data: {
            accessToken
        }
    })
}
