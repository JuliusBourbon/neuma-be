import { attemptRepository } from "../repositories/attempt.repository.js";
import { levelRepository } from "../repositories/level.repository.js";
import { progressRepository } from "../repositories/progress.repository.js";
import { AppError } from "./auth.service.js";
import { QuestionType, ProgressStatus } from "../generated/prisma/client.js";
import { achievementService } from "./achievement.service.js";

const POINTS_FIRST_TRY = 100;
const POINTS_SECOND_TRY = 50;
const STREAK_INCREMENT = 10;

export const attemptService = {
    startAttempt: async (userId: string, levelId: string) => {
        const level = await levelRepository.findById(levelId);
        if (!level) throw new AppError(404, "Level tidak ditemukan");

        const attempt = await attemptRepository.createAttempt(userId, levelId);
        return { attemptId: attempt.id, levelId };
    },

    submitAnswer: async (
        userId: string,
        attemptId: string,
        questionId: string,
        userAnswer: string
    ) => {
        const attempt = await attemptRepository.findAttemptById(attemptId);
        if (!attempt) throw new AppError(404, "Sesi tes tidak ditemukan");
        if (attempt.userId !== userId) throw new AppError(403, "Akses ditolak");
        if (attempt.finishedAt) throw new AppError(400, "Sesi tes sudah selesai");

        const question = await attemptRepository.findQuestionById(questionId);
        if (!question) throw new AppError(404, "Soal tidak ditemukan");
        if (question.levelId !== attempt.levelId) {
            throw new AppError(400, "Soal tidak sesuai dengan level sesi ini");
        }

        const previousTries = await attemptRepository.countAnswersForQuestion(
            attemptId,
            questionId
        );
        const attemptNumber = previousTries + 1;
        // Tidak ada lagi batas maksimal — percobaan ke-3+ tetap diterima, tapi 0 poin

        const isCorrect = attemptService._checkAnswer(question, userAnswer);

        let pointsEarned = 0;
        let streakBonus = 0;

        if (isCorrect) {
            if (attemptNumber === 1) {
                pointsEarned = POINTS_FIRST_TRY;
            } else if (attemptNumber === 2) {
                pointsEarned = POINTS_SECOND_TRY;
            } else {
                pointsEarned = 0; // percobaan ke-3 dst tidak dapat poin, sekadar latihan
            }

            // Streak bonus hanya berlaku untuk kemenangan attempt ke-1 (sesuai spesifikasi awal)
            if (attemptNumber === 1) {
                const currentStreak = await attemptService._calculateCurrentStreak(attemptId);
                streakBonus = currentStreak * STREAK_INCREMENT;
            }
        }

        await attemptRepository.createAnswer({
            attemptId,
            questionId,
            isCorrect,
            attemptNumber,
            pointsEarned,
            streakBonus,
        });

        return {
            isCorrect,
            attemptNumber,
            pointsEarned,
            streakBonus,
            totalThisAnswer: pointsEarned + streakBonus,
        };
    },

    // Soal di-skip: dicatat sebagai jawaban salah/kosong, 0 poin, memutus streak
    skipQuestion: async (userId: string, attemptId: string, questionId: string) => {
        const attempt = await attemptRepository.findAttemptById(attemptId);
        if (!attempt) throw new AppError(404, "Sesi tes tidak ditemukan");
        if (attempt.userId !== userId) throw new AppError(403, "Akses ditolak");
        if (attempt.finishedAt) throw new AppError(400, "Sesi tes sudah selesai");

        const question = await attemptRepository.findQuestionById(questionId);
        if (!question) throw new AppError(404, "Soal tidak ditemukan");

        const previousTries = await attemptRepository.countAnswersForQuestion(attemptId, questionId);

        await attemptRepository.createAnswer({
            attemptId,
            questionId,
            isCorrect: false,
            attemptNumber: previousTries + 1,
            pointsEarned: 0,
            streakBonus: 0,
        });

        return { skipped: true, questionId };
    },

    finishAttempt: async (userId: string, attemptId: string) => {
        const attempt = await attemptRepository.findAttemptById(attemptId);
        if (!attempt) throw new AppError(404, "Sesi tes tidak ditemukan");
        if (attempt.userId !== userId) throw new AppError(403, "Akses ditolak");
        if (attempt.finishedAt) throw new AppError(400, "Sesi tes sudah pernah diselesaikan");

        // Tidak lagi mewajibkan semua soal terjawab benar — skip diperbolehkan.
        // Cukup pastikan minimal ada 1 record (jawab/skip) per soal, agar tidak finish sesi kosong.
        if (attempt.answers.length === 0) {
            throw new AppError(400, "Belum ada soal yang dikerjakan");
        }

        // Ambil skor terbaik per soal (karena bisa dicoba berkali-kali, ambil percobaan dgn poin tertinggi)
        const bestPerQuestion = new Map<string, { pointsEarned: number; streakBonus: number }>();
        for (const ans of attempt.answers) {
            const current = bestPerQuestion.get(ans.questionId);
            const thisTotal = ans.pointsEarned + ans.streakBonus;
            const currentTotal = current ? current.pointsEarned + current.streakBonus : -1;
            if (thisTotal > currentTotal) {
                bestPerQuestion.set(ans.questionId, {
                    pointsEarned: ans.pointsEarned,
                    streakBonus: ans.streakBonus,
                });
            }
        }

        const totalScore = Array.from(bestPerQuestion.values()).reduce(
            (sum, a) => sum + a.pointsEarned + a.streakBonus,
            0
        );

        await attemptRepository.finishAttempt(attemptId, totalScore);
        await progressRepository.updateBestScoreIfHigher(userId, attempt.levelId, totalScore);

        const level = await levelRepository.findById(attempt.levelId);
        if (level) {
            const nextLevel = await levelRepository.findByOrder(level.order + 1);
            if (nextLevel) {
                const nextProgress = await progressRepository.findOne(userId, nextLevel.id);
                if (!nextProgress || nextProgress.status === ProgressStatus.LOCKED) {
                    await progressRepository.upsertStatus(userId, nextLevel.id, ProgressStatus.UNLOCKED);
                }
            }
        }

        const newAchievements = await achievementService.checkAndUnlockAchievements(userId);

        return { attemptId, totalScore, newAchievements };
    },

    _checkAnswer: (
        question: { type: QuestionType; correctAnswer: string },
        userAnswer: string
    ): boolean => {
        return (
            question.correctAnswer.trim().toUpperCase() === userAnswer.trim().toUpperCase()
        );
    },

    _calculateCurrentStreak: async (attemptId: string): Promise<number> => {
        const sequence = await attemptRepository.getCorrectAnswerSequence(attemptId);
        let streak = 0;
        for (let i = sequence.length - 1; i >= 0; i--) {
            if (sequence[i].isCorrect) {
                streak++;
            } else {
                break;
            }
        }
        return streak;
    },
};