import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { prisma } from "../config/prisma.js";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function login(req: Request, res: Response) {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Invalid input" });
  }
  const { email, password } = parsed.data;

  const admin = await prisma.admin.findUnique({ where: { email } });
  const ok = admin && (await bcrypt.compare(password, admin.passwordHash));

  // رسالة واحدة للحالتين حتى لا نكشف هل البريد موجود
  if (!admin || !ok) {
    return res.status(401).json({ message: "Invalid email or password" });
  }

  const token = jwt.sign({ sub: String(admin.id) }, process.env.JWT_SECRET!, {
    expiresIn: "7d",
  });

  res.json({
    token,
    admin: { id: admin.id, email: admin.email, name: admin.name },
  });
}

export async function me(req: Request, res: Response) {
  const admin = await prisma.admin.findUnique({
    where: { id: req.adminId },
    select: { id: true, email: true, name: true },
  });
  if (!admin) return res.status(401).json({ message: "Unauthorized" });
  res.json({ admin });
}