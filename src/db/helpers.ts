import { prisma } from './prisma'

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

export const updateAccessToken = async (userId: string, accessToken: string) => {
    return await prisma.user.update({
        where: {
            userId
        },
        data: {
            accessToken
        }
    })
}

export const getUser = async (userId: string | number) => {
    const user = await prisma.user.findUnique({
        where: {
            userId: userId.toString()
        }
    })

    return user
}
