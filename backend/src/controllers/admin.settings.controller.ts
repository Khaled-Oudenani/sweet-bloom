import { Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../config/prisma.js";
import { HttpError } from "../utils/httpError.js";

const idParam = z.coerce.number().int();

// ───── الكوبونات ─────
const couponBase = z.object({
  code: z
    .string()
    .trim()
    .toUpperCase()
    .regex(/^[A-Z0-9_-]{3,20}$/, "Code must be 3-20 chars: A-Z, 0-9, - or _"),
  type: z.enum(["PERCENT", "FIXED"]),
  value: z.number().int().min(1),
  minOrder: z.number().int().min(0).optional(),
  maxUses: z.number().int().min(1).nullable().optional(),
  expiresAt: z.coerce.date().nullable().optional(),
  isActive: z.boolean().optional(),
});

function assertPercent(type: string, value: number) {
  if (type === "PERCENT" && value > 100) throw new HttpError(400, "Percent value must be 100 or less");
}

export async function listCoupons(_req: Request, res: Response) {
  res.json({ data: await prisma.coupon.findMany({ orderBy: { id: "desc" } }) });
}

export async function createCoupon(req: Request, res: Response) {
  const data = couponBase.parse(req.body);
  assertPercent(data.type, data.value);
  res.status(201).json({ data: await prisma.coupon.create({ data }) });
}

export async function updateCoupon(req: Request, res: Response) {
  const id = idParam.parse(req.params.id);
  const data = couponBase.partial().parse(req.body);
  const existing = await prisma.coupon.findUniqueOrThrow({ where: { id } });
  assertPercent(data.type ?? existing.type, data.value ?? existing.value);
  res.json({ data: await prisma.coupon.update({ where: { id }, data }) });
}

export async function deleteCoupon(req: Request, res: Response) {
  await prisma.coupon.delete({ where: { id: idParam.parse(req.params.id) } });
  res.status(204).end();
}

// ───── مناطق التوصيل ─────
const zoneBase = z.object({
  wilaya: z.string().trim().min(2),
  fee: z.number().int().min(0),
  freeAbove: z.number().int().min(0).nullable().optional(),
  isActive: z.boolean().optional(),
});

export async function listZones(_req: Request, res: Response) {
  res.json({ data: await prisma.deliveryZone.findMany({ orderBy: { wilaya: "asc" } }) });
}

export async function createZone(req: Request, res: Response) {
  const data = zoneBase.parse(req.body);
  res.status(201).json({ data: await prisma.deliveryZone.create({ data }) });
}

export async function updateZone(req: Request, res: Response) {
  const id = idParam.parse(req.params.id);
  const data = zoneBase.partial().parse(req.body);
  res.json({ data: await prisma.deliveryZone.update({ where: { id }, data }) });
}

export async function deleteZone(req: Request, res: Response) {
  await prisma.deliveryZone.delete({ where: { id: idParam.parse(req.params.id) } });
  res.status(204).end();
}