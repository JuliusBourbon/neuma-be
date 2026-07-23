import { Router } from "express";
import { achievementController } from "../controllers/achievement.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = Router();
router.use(authMiddleware);
router.get("/", achievementController.list);

export default router;