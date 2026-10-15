import { Request, Response } from "express";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { prisma } from "../config/prisma";
import { slugify } from "../utils/slugify";

const csv = z
  .string()
  .optional()
  .transform((s) => (s ? s.split(",").filter(Boolean) : []));

const listQuery = z.object({
  category: z.string().optional(),
  search: z.string().trim().optional(),
  minPrice: z.coerce.number().int().min(0).optional(),
  maxPrice: z.coerce.number().int().min(0).optional(),
  dietary: csv,
  flavor: csv,
  sort: z.enum(["featured", "price_asc", "price_desc", "newest"]).default("featured"),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(8),
});

const orderByMap: Record<string, Prisma.ProductOrderByWithRelationInput[]> = {
  featured: [{ isFeatured: "desc" }, { createdAt: "desc" }],
  price_asc: [{ basePrice: "asc" }],
  price_desc: [{ basePrice: "desc" }],
  newest: [{ createdAt: "desc" }],
};

const productInclude = {
  category: { select: { id: true, name: true, slug: true } },
  variants: { where: { isActive: true }, orderBy: { price: "asc" } },
  dietaryTags: true,
  flavors: true,
  images: { orderBy: { sortOrder: "asc" } },
} satisfies Prisma.ProductInclude;

// متوسط التقييم وعدد التقييمات المعتمدة
async function ratingsFor(ids: number[]) {
  const rows = await prisma.review.groupBy({
    by: ["productId"],
    where: { productId: { in: ids }, isApproved: true },
    _avg: { rating: true },
    _count: { _all: true },
  });
  return new Map(
    rows.map((r) => [
      r.productId,
      { rating: Number((r._avg.rating ?? 0).toFixed(1)), reviewCount: r._count._all },
    ]),
  );
}

// ───── عام ─────
export async function listProducts(req: Request, res: Response) {
  const q = listQuery.parse(req.query);

  const where: Prisma.ProductWhereInput = {
    isActive: true,
    ...(q.category && { category: { slug: q.category } }),
    ...(q.search && {
      OR: [
        { name: { contains: q.search, mode: "insensitive" } },
        { shortDescription: { contains: q.search, mode: "insensitive" } },
      ],
    }),
    ...(q.dietary.length && {
      AND: q.dietary.map((slug) => ({ dietaryTags: { some: { slug } } })),
    }),
    ...(q.flavor.length && { flavors: { some: { slug: { in: q.flavor } } } }),
    ...((q.minPrice !== undefined || q.maxPrice !== undefined) && {
      basePrice: { gte: q.minPrice, lte: q.maxPrice },
    }),
  };

  const [total, products] = await Promise.all([
    prisma.product.count({ where }),
    prisma.product.findMany({
      where,
      include: productInclude,
      orderBy: orderByMap[q.sort],
      skip: (q.page - 1) * q.limit,
      take: q.limit,
    }),
  ]);

  const ratings = await ratingsFor(products.map((p) => p.id));
  const data = products.map((p) => ({
    ...p,
    ...(ratings.get(p.id) ?? { rating: 0, reviewCount: 0 }),
  }));

  res.json({
    data,
    meta: { page: q.page, limit: q.limit, total, totalPages: Math.ceil(total / q.limit) },
  });
}

export async function getProduct(req: Request, res: Response) {
  const product = await prisma.product.findFirst({
    where: { slug: String(req.params.slug), isActive: true },
    include: {
      ...productInclude,
      reviews: { where: { isApproved: true }, orderBy: { createdAt: "desc" }, take: 20 },
    },
  });
  if (!product) return res.status(404).json({ message: "Product not found" });

  const related = await prisma.product.findMany({
    where: { isActive: true, categoryId: product.categoryId, id: { not: product.id } },
    include: productInclude,
    take: 4,
  });

  const ratings = await ratingsFor([product.id]);
  res.json({
    data: { ...product, ...(ratings.get(product.id) ?? { rating: 0, reviewCount: 0 }) },
    related,
  });
}

// ───── أدمن ─────
const variantSchema = z.object({
  label: z.string().min(1),
  serves: z.string().optional(),
  price: z.number().int().min(0),
  stock: z.number().int().min(0).default(0),
});

const createSchema = z.object({
  name: z.string().min(2),
  slug: z.string().optional(),
  categoryId: z.number().int(),
  shortDescription: z.string().optional(),
  description: z.string().optional(),
  ingredients: z.string().optional(),
  allergyInfo: z.string().optional(),
  imageUrl: z.string().url().optional(),
  badge: z.enum(["BESTSELLER", "NEW", "CHEFS_PICK", "POPULAR", "LIMITED"]).nullable().optional(),
  isFeatured: z.boolean().optional(),
  isActive: z.boolean().optional(),
  variants: z.array(variantSchema).min(1),
  dietaryTagIds: z.array(z.number().int()).optional(),
  flavorIds: z.array(z.number().int()).optional(),
});
const updateSchema = createSchema.partial();

const idParam = z.coerce.number().int();
const minPrice = (v: { price: number }[]) => Math.min(...v.map((x) => x.price));

export async function createProduct(req: Request, res: Response) {
  const { variants, dietaryTagIds, flavorIds, slug, ...rest } = createSchema.parse(req.body);

  const product = await prisma.product.create({
    data: {
      ...rest,
      slug: slug ? slugify(slug) : slugify(rest.name),
      basePrice: minPrice(variants),
      variants: { create: variants },
      dietaryTags: { connect: (dietaryTagIds ?? []).map((id) => ({ id })) },
      flavors: { connect: (flavorIds ?? []).map((id) => ({ id })) },
    },
    include: productInclude,
  });
  res.status(201).json({ data: product });
}

export async function updateProduct(req: Request, res: Response) {
  const id = idParam.parse(req.params.id);
  const { variants, dietaryTagIds, flavorIds, slug, ...rest } = updateSchema.parse(req.body);

  const product = await prisma.$transaction(async (tx) => {
    if (variants) {
      await tx.productVariant.deleteMany({ where: { productId: id } });
      await tx.productVariant.createMany({ data: variants.map((v) => ({ ...v, productId: id })) });
    }
    return tx.product.update({
      where: { id },
      data: {
        ...rest,
        ...(slug && { slug: slugify(slug) }),
        ...(variants && { basePrice: minPrice(variants) }),
        ...(dietaryTagIds && { dietaryTags: { set: dietaryTagIds.map((i) => ({ id: i })) } }),
        ...(flavorIds && { flavors: { set: flavorIds.map((i) => ({ id: i })) } }),
      },
      include: productInclude,
    });
  });
  res.json({ data: product });
}

// حذف ناعم: لا نحذف المنتج فعليًا لأن الطلبات القديمة تشير إليه
export async function deleteProduct(req: Request, res: Response) {
  const id = idParam.parse(req.params.id);
  await prisma.product.update({ where: { id }, data: { isActive: false } });
  res.status(204).end();
}