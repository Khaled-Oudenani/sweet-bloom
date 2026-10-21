import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { ZodError } from "zod";
import { Prisma } from "@prisma/client";
import authRoutes from "./routes/auth.routes.js";
import productRoutes from "./routes/product.routes.js";
import categoryRoutes from "./routes/category.routes.js";
import { HttpError } from "./utils/httpError.js";
import orderRoutes from "./routes/order.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import multer from "multer";
import publicRoutes from "./routes/public.routes.js";

const app = express();

app.use(helmet());
const allowedOrigins = (process.env.CORS_ORIGIN ?? "http://localhost:3000")
  .split(",")
  .map((s) => s.trim());

app.use(cors({ origin: allowedOrigins }));
// app.use(cors({ origin: "http://localhost:3000" }));
app.use(express.json());
app.set("trust proxy", 1);
app.use(morgan("dev"));



app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api", orderRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api", publicRoutes);

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});
// معالج الأخطاء: يجب أن يكون بعد كل المسارات
app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  if (err instanceof HttpError) {
    return res.status(err.status).json({ message: err.message });
  }
  if (err instanceof multer.MulterError) {
    const message = err.code === "LIMIT_FILE_SIZE" ? "Image too large (max 5 MB)" : err.message;
    return res.status(400).json({ message });
  }
  if (err instanceof ZodError) {
    return res.status(400).json({ message: "Validation error", errors: err.issues });
  }
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2002") return res.status(409).json({ message: "Already exists" });
    if (err.code === "P2025") return res.status(404).json({ message: "Not found" });
  }
  console.error(err);
  res.status(500).json({ message: "Internal server error" });
});

export default app;