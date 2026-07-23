import { Router } from "express";
import { avatarController } from "../controllers/avatar.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = Router();
router.use(authMiddleware);
router.get("/", avatarController.list);
router.post("/select", avatarController.select);

export default router;