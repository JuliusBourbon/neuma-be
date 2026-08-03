import { achievementRepository } from "../repositories/achievement.repository.js";
import { progressRepository } from "../repositories/progress.repository.js";

// Definisi rule: kode achievement -> fungsi pengecekan
// Mudah ditambah tanpa mengubah logic inti
type AchievementChecker = (userId: string) => Promise<boolean>;

// Logic akan ditangani langsung di dalam checkAndUnlockAchievements secara dinamis

export const achievementService = {
    // Dipanggil setelah finishAttempt — cek semua rule, unlock yang memenuhi syarat
    checkAndUnlockAchievements: async (userId: string) => {
        const allAchievements = await achievementRepository.findAll();
        const userProgress = await progressRepository.findAllByUser(userId);
        const completedCount = userProgress.filter((p) => p.status === "COMPLETED").length;
        const perfectCount = userProgress.filter((p) => p.bestScore >= 100).length; // Sesuaikan threshold

        const newlyUnlocked = [];

        for (const achievement of allAchievements) {
            let eligible = false;
            
            if (achievement.code.startsWith("COMPLETE_LEVEL_")) {
                const levelNum = parseInt(achievement.code.replace("COMPLETE_LEVEL_", ""));
                if (!isNaN(levelNum)) eligible = completedCount >= levelNum;
            } else if (achievement.code === "COMPLETE_ALL_LEVELS") {
                eligible = completedCount >= 26;
            } else if (achievement.code.startsWith("PERFECT_STREAK_")) {
                const streakNum = achievement.code === "PERFECT_STREAK_ALL" ? 26 : parseInt(achievement.code.replace("PERFECT_STREAK_", ""));
                if (!isNaN(streakNum)) eligible = perfectCount >= streakNum;
            } else if (achievement.code === "PERFECT_SCORE_ANY_LEVEL") {
                eligible = perfectCount >= 1;
            }

            if (eligible) {
                const result = await achievementRepository.unlockForUser(userId, achievement.id);
                // Hanya tambahkan ke list jika baru saja di-unlock (tidak dilempar error unik oleh repository)
                if (result) {
                    newlyUnlocked.push({
                        code: achievement.code,
                        title: achievement.title,
                        unlockedAt: result.unlockedAt,
                        avatarRewardSeed: achievement.rewardAvatar?.seed,
                        avatarRewardStyle: achievement.rewardAvatar?.style,
                    });
                }
            }
        }

        return newlyUnlocked;
    },

    listAllWithStatus: async (userId: string) => {
        // Sync achievements retroactively just in case
        await achievementService.checkAndUnlockAchievements(userId);

        const [all, unlocked] = await Promise.all([
            achievementRepository.findAll(),
            achievementRepository.findUnlockedByUser(userId),
        ]);

        const unlockedIds = new Set(unlocked.map((u) => u.achievementId));
        const userProgress = await progressRepository.findAllByUser(userId);
        const completedLevelsCount = userProgress.filter((p) => p.status === "COMPLETED").length;
        const hasPerfectScore = userProgress.some((p) => p.bestScore >= 100);

        return all.map((a) => {
            let progress = 0;
            let target = 1;

            if (a.code.startsWith("COMPLETE_LEVEL_")) {
                const levelNum = parseInt(a.code.replace("COMPLETE_LEVEL_", ""));
                if (!isNaN(levelNum)) {
                    target = levelNum;
                    progress = Math.min(completedLevelsCount, target);
                }
            } else if (a.code === "COMPLETE_ALL_LEVELS") {
                target = 26;
                progress = Math.min(completedLevelsCount, target);
            } else if (a.code.startsWith("PERFECT_STREAK_")) {
                const streakNum = a.code === "PERFECT_STREAK_ALL" ? 26 : parseInt(a.code.replace("PERFECT_STREAK_", ""));
                if (!isNaN(streakNum)) {
                    target = streakNum;
                    const perfectCount = userProgress.filter((p) => p.bestScore >= 100).length;
                    progress = Math.min(perfectCount, target);
                }
            } else if (a.code === "PERFECT_SCORE_ANY_LEVEL") {
                target = 1;
                progress = hasPerfectScore ? 1 : 0;
            }

            return {
                id: a.id,
                code: a.code,
                title: a.title,
                description: a.description,
                isUnlocked: unlockedIds.has(a.id),
                progress: progress,
                target: target,
                rewardAvatarId: a.rewardAvatarId,
                rewardAvatarSeed: a.rewardAvatar?.seed,
                rewardAvatarStyle: a.rewardAvatar?.style,
            };
        });
    },
};