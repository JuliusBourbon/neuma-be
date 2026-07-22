import { prisma } from "../lib/prisma.js";

export const onboardingRepository = {
    upsert: (
        userId: string,
        data: { school?: string; age?: number; grade?: string; hobby?: string }
    ) => {
        return prisma.onboardingData.upsert({
            where: { userId },
            update: data,
            create: { userId, ...data },
        });
    },

    findByUserId: (userId: string) => {
        return prisma.onboardingData.findUnique({ where: { userId } });
    },
};