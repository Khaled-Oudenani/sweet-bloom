import { Router } from "express";
import rateLimit from "express-rate-limit";
import { create, listDeliveryZones, quote } from "../controllers/order.controller.js";

const router = Router();

// حماية من الطلبات الوهمية (مهم جدًا مع الدفع عند الاستلام)
const createLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 20,
  message: { message: "Too many orders from this connection, try again later" },
});

router.get("/delivery-zones", listDeliveryZones);
router.post("/orders/quote", quote);
router.post("/orders", createLimiter, create);

export default router;