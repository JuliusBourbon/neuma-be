import { Router } from "express";
import { userController } from "../controllers/user.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(authMiddleware);
router.get("/me", userController.getMe);
router.patch("/me", userController.updateProfile);
router.patch("/me/password", userController.updatePassword);

export default router;