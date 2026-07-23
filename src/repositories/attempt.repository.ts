import { prisma } from "../lib/prisma.js";

export const attemptRepository = {
    createAttempt: (userId: string, levelId: string) => {
        return prisma.levelAttempt.create({
            data: { userId, levelId },
        });
    },

    findAttemptById: (attemptId: string) => {
        return prisma.levelAttempt.findUnique({
            where: { id: attemptId },
            include: { answers: true },
        });
    },

    findQuestionById: (questionId: string) => {
        return prisma.question.findUnique({
            where: { id: questionId },
            include: { options: true },
        });
    },

    countAnswersForQuestion: (attemptId: string, questionId: string) => {
        return prisma.attemptAnswer.count({
            where: { attemptId, questionId },
        });
    },

    // ambil semua jawaban BENAR terakhir dalam attempt ini, urut waktu, untuk hitung streak
    getCorrectAnswerSequence: (attemptId: string) => {
        return prisma.attemptAnswer.findMany({
            where: { attemptId },
            orderBy: { answeredAt: "asc" },
        });
    },

    createAnswer: (data: {
        attemptId: string;
        questionId: string;
        isCorrect: boolean;
        attemptNumber: number;
        pointsEarned: number;
        streakBonus: number;
    }) => {
        return prisma.attemptAnswer.create({ data });
    },

    finishAttempt: (attemptId: string, totalScore: number) => {
        return prisma.levelAttempt.update({
            where: { id: attemptId },
            data: { totalScore, finishedAt: new Date() },
        });
    },

    countQuestionsInLevel: (levelId: string) => {
        return prisma.question.count({ where: { levelId } });
    },
};