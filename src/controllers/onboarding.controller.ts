import { Response, NextFunction } from "express";
import { AuthRequest } from "../middlewares/auth.middleware.js";
import { onboardingSchema } from "../validators/auth.validator.js";
import { onboardingService } from "../services/onboarding.service.js";

export const onboardingController = {
    submit: async (req: AuthRequest, res: Response, next: NextFunction) => {
        try {
            const data = onboardingSchema.parse(req.body);
            const result = await onboardingService.submit(req.userId!, data);
            res.status(200).json(result);
        } catch (err) {
            next(err);
        }
    },

    get: async (req: AuthRequest, res: Response, next: NextFunction) => {
        try {
            const result = await onboardingService.get(req.userId!);
            res.json(result);
        } catch (err) {
            next(err);
        }
    },
};