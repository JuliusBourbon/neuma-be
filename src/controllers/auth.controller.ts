import { Request, Response, NextFunction } from "express";
import { registerSchema, loginSchema } from "../validators/auth.validator.js";
import { authService } from "../services/auth.service.js";

export const authController = {
    register: async (req: Request, res: Response, next: NextFunction) => {
        try {
            const data = registerSchema.parse(req.body);
            const result = await authService.register(data.name, data.password);
            res.status(201).json(result);
        } catch (err) {
            next(err);
        }
    },

    login: async (req: Request, res: Response, next: NextFunction) => {
        try {
            const data = loginSchema.parse(req.body);
            const result = await authService.login(data.name, data.password);
            res.status(200).json(result);
        } catch (err) {
            next(err);
        }
    },
};