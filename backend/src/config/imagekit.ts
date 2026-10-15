import { randomUUID } from "crypto";
import path from "path";
import ImageKit, { toFile } from "@imagekit/nodejs";

const client = new ImageKit({ privateKey: process.env.IMAGEKIT_PRIVATE_KEY! });

export async function uploadImage(file: Express.Multer.File, folder: string) {
  const ext = path.extname(file.originalname).toLowerCase() || ".jpg";
  const name = `${randomUUID()}${ext}`;
  const result = await client.files.upload({
    file: await toFile(file.buffer, name),
    fileName: name,
    folder,
  });
  return { url: result.url!, fileId: result.fileId! };
}

export async function deleteImage(fileId: string) {
  // فشل الحذف من ImageKit لا يجب أن يوقف العملية
  await client.files.delete(fileId).catch((e) => console.error("ImageKit delete failed", e));
}