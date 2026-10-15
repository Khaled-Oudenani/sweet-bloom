import { Router } from "express";
import rateLimit from "express-rate-limit";
import { login, me } from "../controllers/auth.controller.js";
import { requireAdmin } from "../middlewares/auth.js";

const router = Router();

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { message: "Too many attempts, try again later" },
});

router.post("/login", loginLimiter, login);
router.get("/me", requireAdmin, me);

export default router;