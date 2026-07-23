import { Router } from "express";
import { attemptController } from "../controllers/attempt.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(authMiddleware);
router.post("/", attemptController.start);
router.post("/:attemptId/answers", attemptController.submitAnswer);
router.post("/:attemptId/finish", attemptController.finish);
router.post("/:attemptId/skip", attemptController.skipQuestion);

export default router;