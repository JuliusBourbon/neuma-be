import { prisma } from "../lib/prisma.js";

export const avatarRepository = {
    findAll: () => {
        return prisma.avatar.findMany();
    },

    findById: (id: string) => {
        return prisma.avatar.findUnique({ where: { id } });
    },

    // Avatar dianggap "unlocked" jika ada di reward achievement yang sudah didapat user
    findUnlockedAvatarsByUser: async (userId: string) => {
        const userAchievements = await prisma.userAchievement.findMany({
            where: { userId },
            include: { achievement: { include: { rewardAvatar: true } } },
        });

        return userAchievements
            .map((ua) => ua.achievement.rewardAvatar)
            .filter((a): a is NonNullable<typeof a> => a !== null);
    },
};