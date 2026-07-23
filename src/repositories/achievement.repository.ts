import { prisma } from "../lib/prisma.js";

export const achievementRepository = {
    findAll: () => {
        return prisma.achievement.findMany({
            include: { rewardAvatar: true },
        });
    },

    findByCode: (code: string) => {
        return prisma.achievement.findUnique({ where: { code } });
    },

    findUnlockedByUser: (userId: string) => {
        return prisma.userAchievement.findMany({
            where: { userId },
            select: { achievementId: true },
        });
    },

    unlockForUser: (userId: string, achievementId: string) => {
        return prisma.userAchievement.upsert({
            where: { userId_achievementId: { userId, achievementId } },
            update: {},
            create: { userId, achievementId },
        });
    },

    findUserAchievementsWithDetail: (userId: string) => {
        return prisma.userAchievement.findMany({
            where: { userId },
            include: { achievement: { include: { rewardAvatar: true } } },
            orderBy: { unlockedAt: "desc" },
        });
    },
};