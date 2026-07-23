import { Router } from "express";
import { levelController } from "../controllers/level.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(authMiddleware);
router.get("/", levelController.list);
router.get("/:id", levelController.detail);
router.get("/:id/materials", levelController.materials);
router.get("/:id/questions", levelController.questions);

export default router;