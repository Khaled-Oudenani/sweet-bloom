import { Router } from "express";
import { requireAdmin } from "../middlewares/auth.js";
import { getOrder, listOrders, setPaid, updateStatus } from "../controllers/admin.order.controller.js";

const router = Router();
router.use(requireAdmin);

router.get("/orders", listOrders);
router.get("/orders/:id", getOrder);
router.patch("/orders/:id/status", updateStatus);
router.patch("/orders/:id/paid", setPaid);

export default router;