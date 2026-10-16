import { Router } from "express";
import rateLimit from "express-rate-limit";
import {
  createCustomRequest, listTestimonials, submitReview, subscribeNewsletter,
} from "../controllers/public.controller.js";

const router = Router();

const limiter = (limit: number) =>
  rateLimit({
    windowMs: 60 * 60 * 1000,
    limit,
    message: { message: "Too many requests, try again later" },
  });

router.get("/testimonials", listTestimonials);
router.post("/products/:slug/reviews", limiter(10), submitReview);
router.post("/custom-cake-requests", limiter(5), createCustomRequest);
router.post("/newsletter", limiter(10), subscribeNewsletter);

export default router;