import { Request, Response } from "express";
import { OrderStatus } from "@prisma/client";
import { prisma } from "../config/prisma.js";

export async function getStats(_req: Request, res: Response) {
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const DAY = 24 * 60 * 60 * 1000;
  const since30 = new Date(Date.now() - 30 * DAY);
  const since14 = new Date(Date.now() - 14 * DAY);
  const live: OrderStatus[] = ["CANCELLED", "RETURNED"]; // مستبعدة من الحسابات

  const [
    ordersToday, pendingOrders, byStatus, delivered30d, pipeline,
    topProducts, lowStock, recentOrders, pendingReviews, newRequests, daily,
  ] = await Promise.all([
    prisma.order.count({ where: { createdAt: { gte: startOfToday } } }),
    prisma.order.count({ where: { status: "PENDING" } }),
    prisma.order.groupBy({ by: ["status"], _count: { _all: true } }),
    prisma.order.aggregate({
      where: { status: "DELIVERED", createdAt: { gte: since30 } },
      _sum: { total: true },
    }),
    prisma.order.aggregate({
      where: { status: { in: ["PENDING", "CONFIRMED", "PREPARING", "OUT_FOR_DELIVERY"] } },
      _sum: { total: true },
    }),
    prisma.orderItem.groupBy({
      by: ["productId", "productName"],
      where: { order: { status: { notIn: live } } },
      _sum: { quantity: true },
      orderBy: { _sum: { quantity: "desc" } },
      take: 5,
    }),
    prisma.productVariant.findMany({
      where: { isActive: true, stock: { lte: 5 }, product: { isActive: true } },
      orderBy: { stock: "asc" },
      take: 10,
      select: { id: true, label: true, stock: true, product: { select: { id: true, name: true } } },
    }),
    prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      select: { id: true, orderNumber: true, customerName: true, total: true, status: true, createdAt: true },
    }),
    prisma.review.count({ where: { isApproved: false } }),
    prisma.customCakeRequest.count({ where: { status: "NEW" } }),
    prisma.$queryRaw<{ day: Date; orders: bigint; revenue: bigint }[]>`
      SELECT date_trunc('day', "createdAt") AS day,
             COUNT(*) AS orders,
             COALESCE(SUM("total"), 0) AS revenue
      FROM "Order"
      WHERE "createdAt" >= ${since14} AND "status"::text NOT IN ('CANCELLED', 'RETURNED')
      GROUP BY 1 ORDER BY 1`,
  ]);

  res.json({
    data: {
      ordersToday,
      pendingOrders,
      pendingReviews,
      newCustomRequests: newRequests,
      revenueDelivered30d: delivered30d._sum.total ?? 0,
      revenuePipeline: pipeline._sum.total ?? 0,
      ordersByStatus: Object.fromEntries(byStatus.map((s) => [s.status, s._count._all])),
      topProducts: topProducts.map((p) => ({
        productId: p.productId,
        name: p.productName,
        sold: p._sum.quantity ?? 0,
      })),
      lowStock,
      recentOrders,
      dailySales: daily.map((d) => ({
        day: d.day.toISOString().slice(0, 10),
        orders: Number(d.orders),
        revenue: Number(d.revenue),
      })),
    },
  });
}