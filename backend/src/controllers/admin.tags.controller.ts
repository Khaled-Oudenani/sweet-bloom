import type { Request, Response } from "express";
import { prisma } from "../config/prisma.js";

export async function listTags(_req: Request, res: Response) {
  const [dietaryTags, flavors] = await Promise.all([
    prisma.dietaryTag.findMany({ orderBy: { name: "asc" } }),
    prisma.flavor.findMany({ orderBy: { name: "asc" } }),
  ]);
  res.json({ data: { dietaryTags, flavors } });
}