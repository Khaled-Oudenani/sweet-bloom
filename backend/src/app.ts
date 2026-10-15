import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import authRoutes from "./routes/auth.routes.js";

const app = express();

app.use(helmet());
app.use(cors({ origin: "http://localhost:3000" }));
app.use(express.json());
app.use(morgan("dev"));

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/auth", authRoutes);

app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err);
  res.status(500).json({ message: "Internal server error" });
});

export default app;