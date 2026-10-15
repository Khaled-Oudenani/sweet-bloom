import { Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../config/prisma.js";
import { deleteImage, uploadImage } from "../config/imagekit.js";
import { HttpError } from "../utils/httpError.js";

const idParam = z.coerce.number().int();

// رفع عام (مثلًا لصورة فئة)، يرجع الرابط لتضعه بنفسك في الحقل المناسب
export async function uploadGeneric(req: Request, res: Response) {
  if (!req.file) throw new HttpError(400, "No image provided (form field name: image)");
  const data = await uploadImage(req.file, "/sweet-bloom/misc");
  res.status(201).json({ data });
}

export async function addProductImage(req: Request, res: Response) {
  const id = idParam.parse(req.params.id);
  if (!req.file) throw new HttpError(400, "No image provided (form field name: image)");

  const product = await prisma.product.findUniqueOrThrow({
    where: { id },
    select: { id: true, imageUrl: true },
  });

  const { url, fileId } = await uploadImage(req.file, "/sweet-bloom/products");
  const count = await prisma.productImage.count({ where: { productId: id } });
  const alt = typeof req.body?.alt === "string" ? req.body.alt : undefined;

  const image = await prisma.productImage.create({
    data: { productId: id, url, fileId, alt, sortOrder: count },
  });

  // أول صورة تصبح الغلاف تلقائيًا
  if (!product.imageUrl) {
    await prisma.product.update({ where: { id }, data: { imageUrl: url } });
  }
  res.status(201).json({ data: image });
}

export async function setCover(req: Request, res: Response) {
  const id = idParam.parse(req.params.id);
  const imageId = idParam.parse(req.params.imageId);
  const image = await prisma.productImage.findFirstOrThrow({ where: { id: imageId, productId: id } });
  const product = await prisma.product.update({ where: { id }, data: { imageUrl: image.url } });
  res.json({ data: product });
}

export async function removeProductImage(req: Request, res: Response) {
  const id = idParam.parse(req.params.id);
  const imageId = idParam.parse(req.params.imageId);

  const image = await prisma.productImage.findFirstOrThrow({ where: { id: imageId, productId: id } });
  await prisma.productImage.delete({ where: { id: imageId } });
  if (image.fileId) await deleteImage(image.fileId);

  // إن كانت هي الغلاف، انقل الغلاف لصورة أخرى (أو null)
  const product = await prisma.product.findUniqueOrThrow({ where: { id } });
  if (product.imageUrl === image.url) {
    const next = await prisma.productImage.findFirst({
      where: { productId: id },
      orderBy: { sortOrder: "asc" },
    });
    await prisma.product.update({ where: { id }, data: { imageUrl: next?.url ?? null } });
  }
  res.status(204).end();
}