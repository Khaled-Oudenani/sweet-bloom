import { Request, Response } from "express";
import { prisma } from "../config/prisma.js";

export async function listCategories(_req: Request, res: Response) {
  const categories = await prisma.category.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
    include: { _count: { select: { products: { where: { isActive: true } } } } },
  });
  res.json({ data: categories });
}