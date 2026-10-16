import { z } from "zod";

const phoneRegex = /^(?:\+213|0)[567]\d{8}$/;

export const phoneSchema = z
  .string()
  .transform((s) => s.replace(/[\s.-]/g, ""))
  .pipe(z.string().regex(phoneRegex, "Invalid Algerian phone number"));