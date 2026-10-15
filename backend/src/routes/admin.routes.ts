import { Router } from "express";
import { requireAdmin } from "../middlewares/auth.js";
import { imageUpload } from "../middlewares/upload.js";
import { getOrder, listOrders, setPaid, updateStatus } from "../controllers/admin.order.controller.js";
import {
  addProductImage, removeProductImage, setCover, uploadGeneric,
} from "../controllers/upload.controller.js";
import {
  createCategory, deleteCategory, getAdminProduct, listAdminCategories,
  listAdminProducts, updateCategory,
} from "../controllers/admin.catalog.controller.js";

const router = Router();
router.use(requireAdmin);

// الطلبات
router.get("/orders", listOrders);
router.get("/orders/:id", getOrder);
router.patch("/orders/:id/status", updateStatus);
router.patch("/orders/:id/paid", setPaid);

// المنتجات
router.get("/products", listAdminProducts);
router.get("/products/:id", getAdminProduct);
router.post("/products/:id/images", imageUpload, addProductImage);
router.patch("/products/:id/images/:imageId/cover", setCover);
router.delete("/products/:id/images/:imageId", removeProductImage);

// الفئات
router.get("/categories", listAdminCategories);
router.post("/categories", createCategory);
router.put("/categories/:id", updateCategory);
router.delete("/categories/:id", deleteCategory);

// رفع عام
router.post("/uploads", imageUpload, uploadGeneric);

export default router;