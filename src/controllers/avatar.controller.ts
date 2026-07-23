import { Response, NextFunction } from "express";
import { AuthRequest } from "../middlewares/auth.middleware.js";
import { avatarService } from "../services/avatar.service.js";

export const avatarController = {
    list: async (req: AuthRequest, res: Response, next: NextFunction) => {
        try {
            const result = await avatarService.listForUser(req.userId!);
            res.json(result);
        } catch (err) {
            next(err);
        }
    },

    select: async (req: AuthRequest, res: Response, next: NextFunction) => {
        try {
            const { avatarId } = req.body;
            if (!avatarId) return res.status(400).json({ message: "avatarId wajib diisi" });

            const result = await avatarService.selectAvatar(req.userId!, avatarId);
            res.json(result);
        } catch (err) {
            next(err);
        }
    },
};