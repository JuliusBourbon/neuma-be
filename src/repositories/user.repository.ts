import { prisma } from "../lib/prisma.js";

export const userRepository = {
    findByName: (name: string) => {
        return prisma.user.findUnique({ where: { name } });
    },

    findById: (id: string) => {
        return prisma.user.findUnique({
            where: { id },
            select: {
                id: true,
                name: true,
                avatarSeed: true,
                avatarStyle: true,
                createdAt: true,
                onboarding: true,
            },
        });
    },

    create: (name: string, passwordHash: string) => {
        return prisma.user.create({
            data: { name, passwordHash },
        });
    },

    updateProfile: (
        id: string,
        data: { name?: string; avatarStyle?: string; avatarSeed?: string }
    ) => {
        return prisma.user.update({
            where: { id },
            data,
        });
    },

    updatePassword: (id: string, passwordHash: string) => {
        return prisma.user.update({
            where: { id },
            data: { passwordHash },
        });
    },
};