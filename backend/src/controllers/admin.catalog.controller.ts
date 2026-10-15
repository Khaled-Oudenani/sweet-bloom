import { Request, Response } from "express";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { prisma } from "../config/prisma.js";
import { slugify } from "../utils/slugify.js";

const idParam = z.coerce.number().int();

// ───── المنتجات (عرض الأدمن: يشمل المخفية) ─────
const listQuery = z.object({
  search: z.string().trim().optional(),
  status: z.enum(["all", "active", "inactive"]).default("all"),
  categoryId: z.coerce.number().int().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export async function listAdminProducts(req: Request, res: Response) {
  const q = listQuery.parse(req.query);
  const where: Prisma.ProductWhereInput = {
    ...(q.status !== "all" && { isActive: q.status === "active" }),
    ...(q.categoryId && { categoryId: q.categoryId }),
    ...(q.search && { name: { contains: q.search, mode: "insensitive" } }),
  };
  const [total, data] = await Promise.all([
    prisma.product.count({ where }),
    prisma.product.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (q.page - 1) * q.limit,
      take: q.limit,
      include: { category: { select: { id: true, name: true } }, variants: true },
    }),
  ]);
  res.json({
    data,
    meta: { page: q.page, limit: q.limit, total, totalPages: Math.ceil(total / q.limit) },
  });
}

export async function getAdminProduct(req: Request, res: Response) {
  const id = idParam.parse(req.params.id);
  const data = await prisma.product.findUniqueOrThrow({
    where: { id },
    include: {
      category: true,
      variants: true,
      images: { orderBy: { sortOrder: "asc" } },
      dietaryTags: true,
      flavors: true,
    },
  });
  res.json({ data });
}

// ───── الفئات ─────
const categorySchema = z.object({
  name: z.string().trim().min(2),
  slug: z.string().optional(),
  description: z.string().optional(),
  imageUrl: z.string().url().nullable().optional(),
  sortOrder: z.number().int().optional(),
  isActive: z.boolean().optional(),
});

export async function listAdminCategories(_req: Request, res: Response) {
  const data = await prisma.category.findMany({
    orderBy: { sortOrder: "asc" },
    include: { _count: { select: { products: true } } },
  });
  res.json({ data });
}

export async function createCategory(req: Request, res: Response) {
  const { slug, ...rest } = categorySchema.parse(req.body);
  const data = await prisma.category.create({
    data: { ...rest, slug: slug ? slugify(slug) : slugify(rest.name) },
  });
  res.status(201).json({ data });
}

export async function updateCategory(req: Request, res: Response) {
  const id = idParam.parse(req.params.id);
  const { slug, ...rest } = categorySchema.partial().parse(req.body);
  const data = await prisma.category.update({
    where: { id },
    data: { ...rest, ...(slug && { slug: slugify(slug) }) },
  });
  res.json({ data });
}

// فئة فيها منتجات تُخفى فقط، وفارغة تُحذف فعليًا
export async function deleteCategory(req: Request, res: Response) {
  const id = idParam.parse(req.params.id);
  const count = await prisma.product.count({ where: { categoryId: id } });
  if (count > 0) {
    await prisma.category.update({ where: { id }, data: { isActive: false } });
  } else {
    await prisma.category.delete({ where: { id } });
  }
  res.status(204).end();
}