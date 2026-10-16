import { Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../config/prisma.js";
import { phoneSchema } from "../schemas/common.js";
import { HttpError } from "../utils/httpError.js";

const reviewSchema = z.object({
  authorName: z.string().trim().min(2).max(60),
  rating: z.number().int().min(1).max(5),
  comment: z.string().trim().max(1000).optional(),
});

// التقييم يُحفظ "قيد المراجعة" ولا يظهر قبل موافقة الأدمن
export async function submitReview(req: Request, res: Response) {
  const data = reviewSchema.parse(req.body);
  const product = await prisma.product.findFirst({
    where: { slug: String(req.params.slug), isActive: true },
    select: { id: true },
  });
  if (!product) throw new HttpError(404, "Product not found");

  await prisma.review.create({ data: { ...data, productId: product.id } });
  res.status(201).json({ message: "Thank you! Your review will appear after approval." });
}

// آراء الزبائن في الصفحة الرئيسية
export async function listTestimonials(_req: Request, res: Response) {
  const data = await prisma.review.findMany({
    where: { isApproved: true, rating: { gte: 4 }, comment: { not: null } },
    orderBy: { createdAt: "desc" },
    take: 9,
    select: {
      id: true,
      authorName: true,
      rating: true,
      comment: true,
      product: { select: { name: true, slug: true } },
    },
  });
  res.json({ data });
}

const customRequestSchema = z.object({
  name: z.string().trim().min(2).max(80),
  phone: phoneSchema,
  email: z.string().email().optional().or(z.literal("").transform(() => undefined)),
  eventDate: z.coerce.date().optional(),
  guests: z.number().int().min(1).max(2000).optional(),
  description: z.string().trim().min(10).max(1500),
});

export async function createCustomRequest(req: Request, res: Response) {
  const data = customRequestSchema.parse(req.body);
  await prisma.customCakeRequest.create({ data });
  res.status(201).json({ message: "Request received. We will contact you soon." });
}

export async function subscribeNewsletter(req: Request, res: Response) {
  const { email } = z
    .object({ email: z.string().trim().toLowerCase().email() })
    .parse(req.body);

  // نفس الرد سواء كان مشتركًا من قبل أم لا
  await prisma.newsletterSubscriber.upsert({ where: { email }, update: {}, create: { email } });
  res.status(201).json({ message: "Subscribed" });
}