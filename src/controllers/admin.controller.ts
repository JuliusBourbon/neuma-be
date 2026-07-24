import { Response, NextFunction } from "express";
import { AuthRequest } from "../middlewares/auth.middleware.js";
import { prisma } from "../lib/prisma.js";
import { AppError } from "../services/auth.service.js";

export const adminController = {
    updateMaterial: async (req: AuthRequest, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params;
            const { content, mediaUrl } = req.body;

            const material = await prisma.material.update({
                where: { id },
                data: { content, mediaUrl },
            });

            res.json(material);
        } catch (err) {
            next(err);
        }
    },

    updateQuestion: async (req: AuthRequest, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params;
            const { prompt, mediaUrl, correctAnswer, options } = req.body;

            const question = await prisma.question.update({
                where: { id },
                data: {
                    prompt,
                    mediaUrl,
                    correctAnswer,
                },
            });

            // Update options if provided
            if (options && Array.isArray(options)) {
                for (const opt of options) {
                    await prisma.questionOption.update({
                        where: { id: opt.id },
                        data: {
                            label: opt.label,
                            content: opt.content,
                            mediaUrl: opt.mediaUrl,
                        },
                    });
                }
            }

            res.json(question);
        } catch (err) {
            next(err);
        }
    },
};
