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

    getUserStats: async (userId: string) => {
        // 1. Poin (Total bestScore)
        const progress = await prisma.userLevelProgress.aggregate({
            where: { userId },
            _sum: { bestScore: true },
        });
        const points = progress._sum.bestScore || 0;

        // 2. Level Completed
        const levelsCompleted = await prisma.userLevelProgress.count({
            where: { userId, status: "COMPLETED" },
        });

        // 3. Pencapaian
        const achievementsCount = await prisma.userAchievement.count({
            where: { userId },
        });

        // 4. Streak
        // Ambil history tanggal dari attempt_answers untuk user ini
        const attempts = await prisma.levelAttempt.findMany({
            where: { userId },
            select: { startedAt: true },
            orderBy: { startedAt: 'desc' },
        });

        let streak = 0;
        if (attempts.length > 0) {
            let lastDate = new Date();
            lastDate.setHours(0, 0, 0, 0);

            // Cek apakah hari ini atau kemarin ada aktivitas
            const firstActivityDate = new Date(attempts[0].startedAt);
            firstActivityDate.setHours(0, 0, 0, 0);

            const diffTime = Math.abs(lastDate.getTime() - firstActivityDate.getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            if (diffDays <= 1) {
                // Streak berjalan
                let currentDate = firstActivityDate;
                const uniqueDays = new Set(attempts.map(a => {
                    const d = new Date(a.startedAt);
                    d.setHours(0, 0, 0, 0);
                    return d.getTime();
                }));
                
                const sortedDays = Array.from(uniqueDays).sort((a, b) => b - a);
                for (let i = 0; i < sortedDays.length; i++) {
                    const day = new Date(sortedDays[i]);
                    const expectedDay = new Date(currentDate);
                    expectedDay.setDate(expectedDay.getDate() - i);
                    
                    if (day.getTime() === expectedDay.getTime()) {
                        streak++;
                    } else {
                        break;
                    }
                }
            }
        }

        // 5. Recent Activities
        // Ambil max 2 achievements terbaru
        const recentAchievements = await prisma.userAchievement.findMany({
            where: { userId },
            orderBy: { unlockedAt: 'desc' },
            take: 2,
            include: { achievement: true },
        });

        const recentLevels = await prisma.userLevelProgress.findMany({
            where: { userId, status: "COMPLETED" },
            orderBy: { updatedAt: 'desc' },
            take: 2,
            include: { level: true },
        });

        const recentActivities = [
            ...recentAchievements.map(a => ({
                id: a.id,
                title: `Mendapat Medali: '${a.achievement.title}'`,
                timestamp: a.unlockedAt,
                type: "achievement"
            })),
            ...recentLevels.map(l => ({
                id: l.id,
                title: `Menyelesaikan Level ${l.level.title || l.level.letter}!`,
                timestamp: l.updatedAt,
                type: "level"
            }))
        ];

        // Sort by timestamp desc and take top 2
        recentActivities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
        
        return {
            points,
            levelsCompleted,
            achievementsCount,
            streak,
            recentActivities: recentActivities.slice(0, 2).map(a => ({
                title: a.title,
                timestamp: a.timestamp.toISOString(),
                type: a.type
            }))
        };
    },

    create: (name: string, passwordHash: string) => {
        return prisma.user.create({
            data: { name, passwordHash, avatarSeed: "Felix", avatarStyle: "adventurer" },
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