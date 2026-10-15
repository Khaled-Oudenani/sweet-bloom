import { Router } from "express";
import {
  listProducts, getProduct, createProduct, updateProduct, deleteProduct,
} from "../controllers/product.controller.js";
import { requireAdmin } from "../middlewares/auth.js";

const router = Router();

router.get("/", listProducts);
router.get("/:slug", getProduct);

router.post("/", requireAdmin, createProduct);
router.put("/:id", requireAdmin, updateProduct);
router.delete("/:id", requireAdmin, deleteProduct);

export default router;