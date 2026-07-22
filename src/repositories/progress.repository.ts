import { prisma } from "../lib/prisma.js";
import { ProgressStatus } from "../generated/prisma/client.js";

export const progressRepository = {
    findAllByUser: (userId: string) => {
        return prisma.userLevelProgress.findMany({
            where: { userId },
        });
    },

    findOne: (userId: string, levelId: string) => {
        return prisma.userLevelProgress.findUnique({
            where: { userId_levelId: { userId, levelId } },
        });
    },

    upsertStatus: (userId: string, levelId: string, status: ProgressStatus) => {
        return prisma.userLevelProgress.upsert({
            where: { userId_levelId: { userId, levelId } },
            update: { status },
            create: { userId, levelId, status },
        });
    },

    updateBestScoreIfHigher: async (
        userId: string,
        levelId: string,
        newScore: number
    ) => {
        const existing = await prisma.userLevelProgress.findUnique({
            where: { userId_levelId: { userId, levelId } },
        });

        if (!existing || newScore > existing.bestScore) {
            return prisma.userLevelProgress.upsert({
                where: { userId_levelId: { userId, levelId } },
                update: { bestScore: newScore, status: ProgressStatus.COMPLETED },
                create: {
                    userId,
                    levelId,
                    bestScore: newScore,
                    status: ProgressStatus.COMPLETED,
                },
            });
        }

        // tetap pastikan status COMPLETED meski skor tidak lebih tinggi
        if (existing.status !== ProgressStatus.COMPLETED) {
            return prisma.userLevelProgress.update({
                where: { userId_levelId: { userId, levelId } },
                data: { status: ProgressStatus.COMPLETED },
            });
        }

        return existing;
    },

    getLeaderboard: (levelId: string, limit = 20) => {
        return prisma.userLevelProgress.findMany({
            where: { levelId, status: "COMPLETED" },
            orderBy: { bestScore: "desc" },
            take: limit,
            include: {
                user: { select: { id: true, name: true, avatarSeed: true, avatarStyle: true } },
            },
        });
    },

    getUserRank: async (levelId: string, userId: string) => {
        const userProgress = await prisma.userLevelProgress.findUnique({
            where: { userId_levelId: { userId, levelId } },
        });
        if (!userProgress || userProgress.status !== "COMPLETED") return null;

        const higherCount = await prisma.userLevelProgress.count({
            where: {
                levelId,
                status: "COMPLETED",
                bestScore: { gt: userProgress.bestScore },
            },
        });

        return { rank: higherCount + 1, score: userProgress.bestScore };
    },
};