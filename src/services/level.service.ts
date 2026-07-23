import { levelRepository } from "../repositories/level.repository.js";
import { progressRepository } from "../repositories/progress.repository.js";
import { AppError } from "./auth.service.js";
import { ProgressStatus } from "../generated/prisma/client.js";

export const levelService = {
    // Homepage: list 26 level dengan status per user
    listForUser: async (userId: string) => {
        const [levels, progressList] = await Promise.all([
            levelRepository.findAllOrdered(),
            progressRepository.findAllByUser(userId),
        ]);

        const progressMap = new Map(progressList.map((p) => [p.levelId, p]));

        return levels.map((level, index) => {
            const progress = progressMap.get(level.id);

            // Level pertama selalu unlocked secara default
            let status: ProgressStatus = progress?.status ?? ProgressStatus.LOCKED;
            if (index === 0 && !progress) {
                status = ProgressStatus.UNLOCKED;
            }

            return {
                id: level.id,
                letter: level.letter,
                order: level.order,
                title: level.title,
                status,
                bestScore: progress?.bestScore ?? 0,
            };
        });
    },

    // Level View: detail + leaderboard
    getDetail: async (userId: string, levelId: string) => {
        const level = await levelRepository.findById(levelId);
        if (!level) throw new AppError(404, "Level tidak ditemukan");

        const progress = await progressRepository.findOne(userId, levelId);

        // Cek gating: level pertama selalu boleh, selainnya cek level sebelumnya
        if (!progress || progress.status === ProgressStatus.LOCKED) {
            if (level.order > 1) {
                const prevLevel = await levelRepository.findByOrder(level.order - 1);
                const prevProgress = prevLevel
                    ? await progressRepository.findOne(userId, prevLevel.id)
                    : null;

                if (!prevProgress || prevProgress.status !== ProgressStatus.COMPLETED) {
                    throw new AppError(403, "Level ini masih terkunci");
                }

                // auto-unlock karena level sebelumnya sudah selesai
                await progressRepository.upsertStatus(userId, levelId, ProgressStatus.UNLOCKED);
            }
        }

        const [leaderboard, userRank] = await Promise.all([
            progressRepository.getLeaderboard(levelId),
            progressRepository.getUserRank(levelId, userId),
        ]);

        return {
            level,
            userProgress: {
                status: progress?.status ?? ProgressStatus.UNLOCKED,
                bestScore: progress?.bestScore ?? 0,
            },
            leaderboard: leaderboard.map((entry) => ({
                userId: entry.user.id,
                name: entry.user.name,
                avatarSeed: entry.user.avatarSeed,
                avatarStyle: entry.user.avatarStyle,
                score: entry.bestScore,
            })),
            userRank,
        };
    },

    getMaterials: async (levelId: string) => {
        const level = await levelRepository.findById(levelId);
        if (!level) throw new AppError(404, "Level tidak ditemukan");

        return levelRepository.findMaterialsByLevelId(levelId);
    },

    getQuestions: async (levelId: string) => {
        const level = await levelRepository.findById(levelId);
        if (!level) throw new AppError(404, "Level tidak ditemukan");

        return levelRepository.findQuestionsByLevelId(levelId);
    },
};