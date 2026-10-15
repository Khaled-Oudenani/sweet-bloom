import multer from "multer";
import { HttpError } from "../utils/httpError.js";

export const imageUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024, files: 1 }, // 5 MB
  fileFilter: (_req, file, cb) => {
    if (["image/jpeg", "image/png", "image/webp"].includes(file.mimetype)) cb(null, true);
    else cb(new HttpError(400, "Only JPG, PNG or WebP images are allowed"));
  },
}).single("image");