import { Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../config/prisma.js";
import { pageMeta, paginate } from "../utils/pagination.js";

const idParam = z.coerce.number().int();
const pageQuery = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

// ───── التقييمات ─────
export async function listReviews(req: Request, res: Response) {
  const q = pageQuery
    .extend({ status: z.enum(["pending", "approved", "all"]).default("pending") })
    .parse(req.query);
  const where = q.status === "all" ? {} : { isApproved: q.status === "approved" };

  const [total, data] = await Promise.all([
    prisma.review.count({ where }),
    prisma.review.findMany({
      where,
      orderBy: { createdAt: "desc" },
      ...paginate(q.page, q.limit),
      include: { product: { select: { id: true, name: true } } },
    }),
  ]);
  res.json({ data, meta: pageMeta(q.page, q.limit, total) });
}

// إضافة تقييم يدويًا (مثلًا رأي وصلك عبر واتساب)
export async function createReview(req: Request, res: Response) {
  const data = z
    .object({
      productId: z.number().int(),
      authorName: z.string().trim().min(2).max(60),
      rating: z.number().int().min(1).max(5),
      comment: z.string().trim().max(1000).optional(),
      isApproved: z.boolean().optional(),
    })
    .parse(req.body);
  const review = await prisma.review.create({
    data: { ...data, isApproved: data.isApproved ?? true },
  });
  res.status(201).json({ data: review });
}

export async function setReviewApproval(req: Request, res: Response) {
  const id = idParam.parse(req.params.id);
  const { isApproved } = z.object({ isApproved: z.boolean() }).parse(req.body);
  const data = await prisma.review.update({ where: { id }, data: { isApproved } });
  res.json({ data });
}

export async function deleteReview(req: Request, res: Response) {
  await prisma.review.delete({ where: { id: idParam.parse(req.params.id) } });
  res.status(204).end();
}

// ───── طلبات الكيك المخصص ─────
export async function listCustomRequests(req: Request, res: Response) {
  const q = pageQuery
    .extend({ status: z.enum(["NEW", "CONTACTED", "DONE"]).optional() })
    .parse(req.query);
  const where = q.status ? { status: q.status } : {};

  const [total, data] = await Promise.all([
    prisma.customCakeRequest.count({ where }),
    prisma.customCakeRequest.findMany({
      where,
      orderBy: { createdAt: "desc" },
      ...paginate(q.page, q.limit),
    }),
  ]);
  res.json({ data, meta: pageMeta(q.page, q.limit, total) });
}

export async function setRequestStatus(req: Request, res: Response) {
  const id = idParam.parse(req.params.id);
  const { status } = z.object({ status: z.enum(["NEW", "CONTACTED", "DONE"]) }).parse(req.body);
  const data = await prisma.customCakeRequest.update({ where: { id }, data: { status } });
  res.json({ data });
}

// ───── النشرة البريدية ─────
export async function listSubscribers(req: Request, res: Response) {
  const q = pageQuery.parse(req.query);
  const [total, data] = await Promise.all([
    prisma.newsletterSubscriber.count(),
    prisma.newsletterSubscriber.findMany({
      orderBy: { createdAt: "desc" },
      ...paginate(q.page, q.limit),
    }),
  ]);
  res.json({ data, meta: pageMeta(q.page, q.limit, total) });
}

export async function deleteSubscriber(req: Request, res: Response) {
  await prisma.newsletterSubscriber.delete({ where: { id: idParam.parse(req.params.id) } });
  res.status(204).end();
}