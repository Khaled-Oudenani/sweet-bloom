import { Request, Response } from "express";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { prisma } from "../config/prisma.js";
import { HttpError } from "../utils/httpError.js";

const STATUSES = [
  "PENDING", "CONFIRMED", "PREPARING", "OUT_FOR_DELIVERY", "DELIVERED", "CANCELLED", "RETURNED",
] as const;

const listQuery = z.object({
  status: z.enum(STATUSES).optional(),
  search: z.string().trim().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});
const idParam = z.coerce.number().int();

export async function listOrders(req: Request, res: Response) {
  const q = listQuery.parse(req.query);
  const where: Prisma.OrderWhereInput = {
    ...(q.status && { status: q.status }),
    ...(q.search && {
      OR: [
        { orderNumber: { contains: q.search, mode: "insensitive" } },
        { customerName: { contains: q.search, mode: "insensitive" } },
        { phone: { contains: q.search } },
      ],
    }),
  };

  const [total, orders] = await Promise.all([
    prisma.order.count({ where }),
    prisma.order.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (q.page - 1) * q.limit,
      take: q.limit,
      include: { _count: { select: { items: true } } },
    }),
  ]);

  res.json({
    data: orders,
    meta: { page: q.page, limit: q.limit, total, totalPages: Math.ceil(total / q.limit) },
  });
}

export async function getOrder(req: Request, res: Response) {
  const id = idParam.parse(req.params.id);
  const order = await prisma.order.findUniqueOrThrow({ where: { id }, include: { items: true } });
  res.json({ data: order });
}

export async function updateStatus(req: Request, res: Response) {
  const id = idParam.parse(req.params.id);
  const { status } = z.object({ status: z.enum(STATUSES) }).parse(req.body);

  const order = await prisma.$transaction(async (tx) => {
    const current = await tx.order.findUniqueOrThrow({ where: { id }, include: { items: true } });
    if (current.status === "CANCELLED") {
      throw new HttpError(409, "Cancelled orders cannot be changed");
    }

    // عند الإلغاء: أعد المخزون وحرّر استعمال الكوبون
    if (status === "CANCELLED") {
      for (const item of current.items) {
        if (item.variantId) {
          await tx.productVariant.update({
            where: { id: item.variantId },
            data: { stock: { increment: item.quantity } },
          });
        }
      }
      if (current.couponCode) {
        await tx.coupon.updateMany({
          where: { code: current.couponCode, usedCount: { gt: 0 } },
          data: { usedCount: { decrement: 1 } },
        });
      }
    }

    return tx.order.update({
      where: { id },
      // في COD يُعتبر الطلب مدفوعًا عند التسليم
      data: { status, ...(status === "DELIVERED" && { isPaid: true }) },
      include: { items: true },
    });
  });

  res.json({ data: order });
}

export async function setPaid(req: Request, res: Response) {
  const id = idParam.parse(req.params.id);
  const { isPaid } = z.object({ isPaid: z.boolean() }).parse(req.body);
  const order = await prisma.order.update({ where: { id }, data: { isPaid } });
  res.json({ data: order });
}