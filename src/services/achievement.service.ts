import { achievementRepository } from "../repositories/achievement.repository.js";
import { progressRepository } from "../repositories/progress.repository.js";

// Definisi rule: kode achievement -> fungsi pengecekan
// Mudah ditambah tanpa mengubah logic inti
type AchievementChecker = (userId: string) => Promise<boolean>;

const ACHIEVEMENT_RULES: Record<string, AchievementChecker> = {
    COMPLETE_LEVEL_1: async (userId) => {
        const progress = await progressRepository.findAllByUser(userId);
        return progress.some((p) => p.status === "COMPLETED");
    },
    COMPLETE_LEVEL_5: async (userId) => {
        const progress = await progressRepository.findAllByUser(userId);
        const completedCount = progress.filter((p) => p.status === "COMPLETED").length;
        return completedCount >= 5;
    },
    COMPLETE_LEVEL_13: async (userId) => {
        const progress = await progressRepository.findAllByUser(userId);
        const completedCount = progress.filter((p) => p.status === "COMPLETED").length;
        return completedCount >= 13;
    },
    COMPLETE_ALL_LEVELS: async (userId) => {
        const progress = await progressRepository.findAllByUser(userId);
        const completedCount = progress.filter((p) => p.status === "COMPLETED").length;
        return completedCount >= 26;
    },
    PERFECT_SCORE_ANY_LEVEL: async (userId) => {
        const progress = await progressRepository.findAllByUser(userId);
        return progress.some((p) => p.bestScore >= 100); // sesuaikan threshold nanti
    },
};

export const achievementService = {
    // Dipanggil setelah finishAttempt — cek semua rule, unlock yang memenuhi syarat
    checkAndUnlockAchievements: async (userId: string) => {
        const allAchievements = await achievementRepository.findAll();
        const newlyUnlocked = [];

        for (const achievement of allAchievements) {
            const checker = ACHIEVEMENT_RULES[achievement.code];
            if (!checker) continue; // achievement tanpa rule terdefinisi, skip (aman)

            const eligible = await checker(userId);
            if (eligible) {
                const result = await achievementRepository.unlockForUser(userId, achievement.id);
                newlyUnlocked.push({
                    code: achievement.code,
                    title: achievement.title,
                    unlockedAt: result.unlockedAt,
                });
            }
        }

        return newlyUnlocked;
    },

    listAllWithStatus: async (userId: string) => {
        const [all, unlocked] = await Promise.all([
            achievementRepository.findAll(),
            achievementRepository.findUnlockedByUser(userId),
        ]);

        const unlockedIds = new Set(unlocked.map((u) => u.achievementId));

        return all.map((a) => ({
            id: a.id,
            code: a.code,
            title: a.title,
            description: a.description,
            isUnlocked: unlockedIds.has(a.id),
        }));
    },
};