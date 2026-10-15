import { z } from "zod";

// أرقام الهاتف الجزائرية: 05/06/07 + 8 أرقام، أو +213
const phoneRegex = /^(?:\+213|0)[567]\d{8}$/;

const itemsSchema = z
  .array(
    z.object({
      variantId: z.number().int(),
      quantity: z.number().int().min(1).max(20),
      inscription: z.string().trim().max(100).optional(),
    }),
  )
  .min(1)
  .max(30);

const emptyToUndefined = (v?: string) => (v ? v : undefined);

export const quoteSchema = z.object({
  items: itemsSchema,
  deliveryType: z.enum(["DELIVERY", "PICKUP"]).default("DELIVERY"),
  wilaya: z.string().trim().optional(),
  couponCode: z.string().trim().optional().transform(emptyToUndefined),
});

export const orderSchema = z
  .object({
    customerName: z.string().trim().min(2).max(80),
    phone: z
      .string()
      .transform((s) => s.replace(/[\s.-]/g, ""))
      .pipe(z.string().regex(phoneRegex, "Invalid Algerian phone number")),
    email: z.string().email().optional().or(z.literal("").transform(() => undefined)),
    wilaya: z.string().trim().optional(),
    address: z.string().trim().max(200).optional(),
    notes: z.string().trim().max(500).optional(),
    deliveryType: z.enum(["DELIVERY", "PICKUP"]).default("DELIVERY"),
    deliveryDate: z.coerce.date().optional(),
    timeWindow: z.enum(["MORNING", "AFTERNOON", "EVENING"]).optional(),
    isGift: z.boolean().default(false),
    giftMessage: z.string().trim().max(250).optional(),
    couponCode: z.string().trim().optional().transform(emptyToUndefined),
    items: itemsSchema,
  })
  .superRefine((d, ctx) => {
    if (d.deliveryType === "DELIVERY") {
      if (!d.wilaya) {
        ctx.addIssue({ code: "custom", path: ["wilaya"], message: "Wilaya is required for delivery" });
      }
      if (!d.address || d.address.length < 5) {
        ctx.addIssue({ code: "custom", path: ["address"], message: "Address is required for delivery" });
      }
    }
    if (d.deliveryDate) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (d.deliveryDate < today) {
        ctx.addIssue({ code: "custom", path: ["deliveryDate"], message: "Delivery date is in the past" });
      }
    }
  });

export type QuoteInput = z.infer<typeof quoteSchema>;
export type CreateOrderInput = z.infer<typeof orderSchema>;