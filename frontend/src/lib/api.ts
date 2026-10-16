const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";

/* ---------- Types ---------- */
export type Badge = "BESTSELLER" | "NEW" | "CHEFS_PICK" | "POPULAR" | "LIMITED";
export type DeliveryType = "DELIVERY" | "PICKUP";
export type TimeWindow = "MORNING" | "AFTERNOON" | "EVENING";

export type Meta = { page: number; limit: number; total: number; totalPages: number };

export type Category = {
  id: number; name: string; slug: string; imageUrl: string | null;
  sortOrder: number; _count: { products: number };
};
export type Variant = { id: number; label: string; serves: string | null; price: number; stock: number };
export type Tag = { id: number; name: string; slug: string };
export type ProductImage = { id: number; url: string; alt?: string | null; isCover?: boolean };

export type Product = {
  id: number; name: string; slug: string; shortDescription: string | null;
  imageUrl: string | null; badge: Badge | null; basePrice: number; isFeatured: boolean;
  category: { id: number; name: string; slug: string };
  variants: Variant[]; dietaryTags: Tag[]; flavors: Tag[]; images: ProductImage[];
  rating: number; reviewCount: number;
};
export type Review = {
  id: number; authorName: string; rating: number; comment: string | null; createdAt: string;
};
export type ProductDetail = Product & {
  description?: string | null; ingredients?: string | null; allergyInfo?: string | null;
  reviews: Review[];
};

export type DeliveryZone = { wilaya: string; fee: number; freeAbove: number | null };

export type QuoteItemInput = { variantId: number; quantity: number; inscription?: string };
export type QuoteInput = {
  items: QuoteItemInput[]; deliveryType?: DeliveryType; wilaya?: string; couponCode?: string;
};
export type Quote = {
  items: { productId: number; variantId: number; productName: string; variantLabel: string; unitPrice: number; quantity: number }[];
  subtotal: number; discount: number; deliveryFee: number; total: number; couponCode: string | null;
};

export type OrderInput = QuoteInput & {
  customerName: string; phone: string; email?: string; address?: string; notes?: string;
  deliveryDate?: string; timeWindow?: TimeWindow; isGift?: boolean; giftMessage?: string;
};
export type Order = {
  id: number; orderNumber: string; status: string; paymentMethod: "COD"; isPaid: boolean;
  subtotal: number; discount: number; deliveryFee: number; total: number;
  items: { productName: string; variantLabel: string; unitPrice: number; quantity: number; inscription?: string | null }[];
};

/* ---------- Fetch wrapper ---------- */
export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public errors?: { path: (string | number)[]; message: string }[]
  ) {
    super(message);
  }
}

async function request<R>(path: string, init?: RequestInit): Promise<R> {
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
  });
  if (res.status === 204) return undefined as R;
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError(res.status, json.message ?? "Request failed", json.errors);
  return json as R;
}

const qs = (params: Record<string, string | number | undefined>) => {
  const p = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => v !== undefined && v !== "" && p.set(k, String(v)));
  const s = p.toString();
  return s ? `?${s}` : "";
};

/* ---------- Endpoints ---------- */
export const getCategories = () =>
  request<{ data: Category[] }>("/categories").then((r) => r.data);

export type ProductQuery = {
  category?: string; search?: string; minPrice?: number; maxPrice?: number;
  dietary?: string; flavor?: string;
  sort?: "featured" | "price_asc" | "price_desc" | "newest";
  page?: number; limit?: number;
};
export const getProducts = (q: ProductQuery = {}) =>
  request<{ data: Product[]; meta: Meta }>(`/products${qs(q)}`);

export const getProduct = (slug: string) =>
  request<{ data: ProductDetail; related: Product[] }>(`/products/${slug}`);

export const getTestimonials = () =>
  request<{ data: (Review & { product?: { name: string; slug: string } })[] }>("/testimonials").then((r) => r.data);

export const getDeliveryZones = () =>
  request<{ data: DeliveryZone[] }>("/delivery-zones").then((r) => r.data);

export const quoteOrder = (body: QuoteInput) =>
  request<{ data: Quote }>("/orders/quote", { method: "POST", body: JSON.stringify(body) }).then((r) => r.data);

export const createOrder = (body: OrderInput) =>
  request<{ data: Order }>("/orders", { method: "POST", body: JSON.stringify(body) }).then((r) => r.data);

export const submitReview = (slug: string, body: { authorName: string; rating: number; comment?: string }) =>
  request(`/products/${slug}/reviews`, { method: "POST", body: JSON.stringify(body) });

export const submitCustomRequest = (body: {
  name: string; phone: string; email?: string; eventDate?: string; guests?: number; description: string;
}) => request("/custom-cake-requests", { method: "POST", body: JSON.stringify(body) });