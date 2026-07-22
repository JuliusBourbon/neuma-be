import { Response, NextFunction } from "express";
import { AuthRequest } from "../middlewares/auth.middleware.js";
import { updateProfileSchema, updatePasswordSchema } from "../validators/auth.validator.js";
import { userService } from "../services/user.service.js";

export const userController = {
    getMe: async (req: AuthRequest, res: Response, next: NextFunction) => {
        try {
            const profile = await userService.getProfile(req.userId!);
            res.json(profile);
        } catch (err) {
            next(err);
        }
    },

    updateProfile: async (req: AuthRequest, res: Response, next: NextFunction) => {
        try {
            const data = updateProfileSchema.parse(req.body);
            const updated = await userService.updateProfile(req.userId!, data);
            res.json(updated);
        } catch (err) {
            next(err);
        }
    },

    updatePassword: async (req: AuthRequest, res: Response, next: NextFunction) => {
        try {
            const data = updatePasswordSchema.parse(req.body);
            await userService.updatePassword(req.userId!, data.oldPassword, data.newPassword);
            res.json({ message: "Password berhasil diubah" });
        } catch (err) {
            next(err);
        }
    },
};