import { Router } from "express";
import { onboardingController } from "../controllers/onboarding.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(authMiddleware);
router.post("/", onboardingController.submit);
router.get("/", onboardingController.get);

export default router;