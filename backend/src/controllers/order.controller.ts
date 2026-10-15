import { Request, Response } from "express";
import { prisma } from "../config/prisma.js";
import { orderSchema, quoteSchema } from "../schemas/order.schema.js";
import { createOrder, quoteOrder } from "../services/order.service.js";

export async function listDeliveryZones(_req: Request, res: Response) {
  const zones = await prisma.deliveryZone.findMany({
    where: { isActive: true },
    orderBy: { wilaya: "asc" },
    select: { wilaya: true, fee: true, freeAbove: true },
  });
  res.json({ data: zones });
}

export async function quote(req: Request, res: Response) {
  const data = quoteSchema.parse(req.body);
  res.json({ data: await quoteOrder(data) });
}

export async function create(req: Request, res: Response) {
  const data = orderSchema.parse(req.body);
  const order = await createOrder(data);
  res.status(201).json({ data: order });
}