import { Router } from "express";
import authRoutes from "./auth.route.js";
import userRoutes from "./user.route.js";
import onboardingRoutes from "./onboarding.route.js";
import levelRoutes from "./level.route.js";
import attemptRoutes from "./attempt.route.js";
import achievementRoutes from "./achievement.route.js";
import avatarRoutes from "./avatar.route.js";

const router = Router();

router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/onboarding", onboardingRoutes);
router.use("/levels", levelRoutes);
router.use("/attempts", attemptRoutes);
router.use("/achievements", achievementRoutes);
router.use("/avatars", avatarRoutes);

export default router;