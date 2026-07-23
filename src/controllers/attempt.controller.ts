import { Response, NextFunction } from "express";
import { AuthRequest } from "../middlewares/auth.middleware.js";
import { submitAnswerSchema } from "../validators/attempt.validator.js";
import { attemptService } from "../services/attempt.service.js";

export const attemptController = {
    start: async (req: AuthRequest, res: Response, next: NextFunction) => {
        try {
            const { levelId } = req.body;
            if (!levelId) return res.status(400).json({ message: "levelId wajib diisi" });

            const result = await attemptService.startAttempt(req.userId!, levelId);
            res.status(201).json(result);
        } catch (err) {
            next(err);
        }
    },

    submitAnswer: async (req: AuthRequest, res: Response, next: NextFunction) => {
        try {
            const data = submitAnswerSchema.parse(req.body);
            const result = await attemptService.submitAnswer(
                req.userId!,
                req.params.attemptId as string,
                data.questionId,
                data.userAnswer
            );
            res.json(result);
        } catch (err) {
            next(err);
        }
    },

    finish: async (req: AuthRequest, res: Response, next: NextFunction) => {
        try {
            const result = await attemptService.finishAttempt(req.userId!, req.params.attemptId as string);
            res.json(result);
        } catch (err) {
            next(err);
        }
    },

    skipQuestion: async (req: AuthRequest, res: Response, next: NextFunction) => {
        try {
            const { questionId } = req.body;
            if (!questionId) return res.status(400).json({ message: "questionId wajib diisi" });
            const result = await attemptService.skipQuestion(
                req.userId!,
                req.params.attemptId as string,
                questionId
            );
            res.json(result);
        } catch (err) {
            next(err);
        }
    },
};