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
import {
  createReview, deleteReview, deleteSubscriber, listCustomRequests, listReviews,
  listSubscribers, setRequestStatus, setReviewApproval,
} from "../controllers/admin.moderation.controller.js";
import {
  createCoupon, createZone, deleteCoupon, deleteZone, listCoupons, listZones,
  updateCoupon, updateZone,
} from "../controllers/admin.settings.controller.js";
import { getStats } from "../controllers/admin.stats.controller.js";

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

// التقييمات
router.get("/reviews", listReviews);
router.post("/reviews", createReview);
router.patch("/reviews/:id", setReviewApproval);
router.delete("/reviews/:id", deleteReview);

// الكيك المخصص
router.get("/custom-requests", listCustomRequests);
router.patch("/custom-requests/:id/status", setRequestStatus);

// النشرة
router.get("/newsletter", listSubscribers);
router.delete("/newsletter/:id", deleteSubscriber);

// الكوبونات
router.get("/coupons", listCoupons);
router.post("/coupons", createCoupon);
router.put("/coupons/:id", updateCoupon);
router.delete("/coupons/:id", deleteCoupon);

// مناطق التوصيل
router.get("/delivery-zones", listZones);
router.post("/delivery-zones", createZone);
router.put("/delivery-zones/:id", updateZone);
router.delete("/delivery-zones/:id", deleteZone);

// الإحصائيات
router.get("/stats", getStats);

export default router;