import { Response, NextFunction } from "express";
import { AuthRequest } from "../middlewares/auth.middleware.js";
import { achievementService } from "../services/achievement.service.js";

export const achievementController = {
    list: async (req: AuthRequest, res: Response, next: NextFunction) => {
        try {
            const result = await achievementService.listAllWithStatus(req.userId!);
            res.json(result);
        } catch (err) {
            next(err);
        }
    },
};