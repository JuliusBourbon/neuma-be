import { Router } from "express";
import { adminController } from "../controllers/admin.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = Router();

// Endpoint for updating material and questions
router.put("/materials/:id", authMiddleware, adminController.updateMaterial);
router.put("/questions/:id", authMiddleware, adminController.updateQuestion);

export default router;
