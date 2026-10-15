import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const payload = jwt.verify(header.slice(7), process.env.JWT_SECRET!) as jwt.JwtPayload;
    req.adminId = Number(payload.sub);
    next();
  } catch {
    res.status(401).json({ message: "Invalid or expired token" });
  }
}