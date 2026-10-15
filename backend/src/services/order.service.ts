import { randomUUID } from "crypto";
import { Prisma } from "@prisma/client";
import { prisma } from "../config/prisma.js";
import { HttpError } from "../utils/httpError.js";
import type { CreateOrderInput, QuoteInput } from "../schemas/order.schema.js";

type Db = Prisma.TransactionClient;

// حساب السعر الكامل من قاعدة البيانات (لا نثق بأي سعر من الزبون)
export async function priceOrder(db: Db, input: QuoteInput, strictDelivery: boolean) {
  const ids = [...new Set(input.items.map((i) => i.variantId))];
  const variants = await db.productVariant.findMany({
    where: { id: { in: ids }, isActive: true, product: { isActive: true } },
    include: { product: { select: { id: true, name: true } } },
  });
  const byId = new Map(variants.map((v) => [v.id, v]));

  const qtyByVariant = new Map<number, number>();
  const lines = input.items.map((item) => {
    const v = byId.get(item.variantId);
    if (!v) throw new HttpError(400, "One of the items is no longer available");
    qtyByVariant.set(v.id, (qtyByVariant.get(v.id) ?? 0) + item.quantity);
    return {
      productId: v.product.id,
      variantId: v.id,
      productName: v.product.name,
      variantLabel: v.label,
      unitPrice: v.price,
      quantity: item.quantity,
      inscription: item.inscription,
    };
  });

  for (const [variantId, qty] of qtyByVariant) {
    const v = byId.get(variantId)!;
    if (qty > v.stock) {
      throw new HttpError(409, `Not enough stock for ${v.product.name} (${v.label})`);
    }
  }

  const subtotal = lines.reduce((sum, l) => sum + l.unitPrice * l.quantity, 0);

  // الكوبون
  let coupon: Awaited<ReturnType<Db["coupon"]["findUnique"]>> = null;
  let discount = 0;
  if (input.couponCode) {
    coupon = await db.coupon.findUnique({ where: { code: input.couponCode.toUpperCase() } });
    const now = new Date();
    if (
      !coupon ||
      !coupon.isActive ||
      (coupon.expiresAt && coupon.expiresAt < now) ||
      (coupon.maxUses !== null && coupon.usedCount >= coupon.maxUses)
    ) {
      throw new HttpError(400, "Invalid or expired coupon");
    }
    if (subtotal < coupon.minOrder) {
      throw new HttpError(400, `Minimum order for this coupon is ${coupon.minOrder} DZD`);
    }
    discount =
      coupon.type === "PERCENT"
        ? Math.floor((subtotal * coupon.value) / 100)
        : Math.min(coupon.value, subtotal);
  }

  // التوصيل
  let deliveryFee = 0;
  if (input.deliveryType === "DELIVERY" && (input.wilaya || strictDelivery)) {
    const zone = input.wilaya
      ? await db.deliveryZone.findFirst({
          where: { wilaya: { equals: input.wilaya, mode: "insensitive" }, isActive: true },
        })
      : null;
    if (!zone) throw new HttpError(400, "Delivery is not available for this wilaya");
    const free = zone.freeAbove !== null && subtotal - discount >= zone.freeAbove;
    deliveryFee = free ? 0 : zone.fee;
  }

  return {
    lines,
    qtyByVariant,
    coupon,
    subtotal,
    discount,
    deliveryFee,
    total: subtotal - discount + deliveryFee,
  };
}

export async function quoteOrder(input: QuoteInput) {
  const p = await priceOrder(prisma, input, false);
  return {
    items: p.lines,
    subtotal: p.subtotal,
    discount: p.discount,
    deliveryFee: p.deliveryFee,
    total: p.total,
    couponCode: p.coupon?.code ?? null,
  };
}

export async function createOrder(data: CreateOrderInput) {
  return prisma.$transaction(async (tx) => {
    const p = await priceOrder(tx, data, true);

    // خصم المخزون بشكل آمن ضد الطلبات المتزامنة
    for (const [variantId, qty] of p.qtyByVariant) {
      const r = await tx.productVariant.updateMany({
        where: { id: variantId, stock: { gte: qty } },
        data: { stock: { decrement: qty } },
      });
      if (r.count !== 1) throw new HttpError(409, "Some items just went out of stock");
    }

    // استهلاك الكوبون
    if (p.coupon) {
      const r = await tx.coupon.updateMany({
        where: {
          id: p.coupon.id,
          ...(p.coupon.maxUses !== null && { usedCount: { lt: p.coupon.maxUses } }),
        },
        data: { usedCount: { increment: 1 } },
      });
      if (r.count !== 1) throw new HttpError(400, "Coupon usage limit reached");
    }

    const order = await tx.order.create({
      data: {
        orderNumber: `tmp-${randomUUID()}`,
        customerName: data.customerName,
        phone: data.phone,
        email: data.email,
        wilaya: data.wilaya ?? "PICKUP",
        address: data.address ?? "PICKUP",
        notes: data.notes,
        deliveryType: data.deliveryType,
        deliveryDate: data.deliveryDate,
        timeWindow: data.timeWindow,
        isGift: data.isGift,
        giftMessage: data.isGift ? data.giftMessage : undefined,
        couponCode: p.coupon?.code,
        subtotal: p.subtotal,
        discount: p.discount,
        deliveryFee: p.deliveryFee,
        total: p.total,
        items: { create: p.lines },
      },
    });

    // رقم الطلب المقروء، مثل SB-20261015-0007
    const ymd = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    return tx.order.update({
      where: { id: order.id },
      data: { orderNumber: `SB-${ymd}-${String(order.id).padStart(4, "0")}` },
      include: { items: true },
    });
  });
}