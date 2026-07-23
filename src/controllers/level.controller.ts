import { Response, NextFunction } from "express";
import { AuthRequest } from "../middlewares/auth.middleware.js";
import { levelService } from "../services/level.service.js";

export const levelController = {
    list: async (req: AuthRequest, res: Response, next: NextFunction) => {
        try {
            const levels = await levelService.listForUser(req.userId!);
            res.json(levels);
        } catch (err) {
            next(err);
        }
    },

    detail: async (req: AuthRequest, res: Response, next: NextFunction) => {
        try {
            const result = await levelService.getDetail(req.userId!, req.params.id as string);
            res.json(result);
        } catch (err) {
            next(err);
        }
    },

    materials: async (req: AuthRequest, res: Response, next: NextFunction) => {
        try {
            const result = await levelService.getMaterials(req.params.id as string);
            res.json(result);
        } catch (err) {
            next(err);
        }
    },

    questions: async (req: AuthRequest, res: Response, next: NextFunction) => {
        try {
            const result = await levelService.getQuestions(req.params.id as string);
            // Hide correct answer from client
            const sanitizedResult = result.map(q => {
                const { correctAnswer, ...rest } = q;
                return rest;
            });
            res.json(sanitizedResult);
        } catch (err) {
            next(err);
        }
    },
};