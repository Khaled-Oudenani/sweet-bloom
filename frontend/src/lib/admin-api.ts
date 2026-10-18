import { ApiError } from "@/lib/api";
import type { Meta } from "@/lib/api";

const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";
const KEY = "sb-admin-token";

export const getToken = () => {
  try { return localStorage.getItem(KEY); } catch { return null; }
};
export const setToken = (t: string) => {
  try { localStorage.setItem(KEY, t); } catch {}
};
export const clearToken = () => {
  try { localStorage.removeItem(KEY); } catch {}
};

export type AdminUser = { id: number; email: string; name: string };

export type Stats = {
  ordersToday: number;
  pendingOrders: number;
  pendingReviews: number;
  newCustomRequests: number;
  revenueDelivered30d: number;
  revenuePipeline: number;
  ordersByStatus: Record<string, number>;
  topProducts: { productId: number; name: string; sold: number }[];
  lowStock: { id: number; label: string; stock: number; product: { id: number; name: string } }[];
  recentOrders: { id: number; orderNumber: string; customerName: string; total: number; status: string; createdAt: string }[];
  dailySales: { day: string; orders: number; revenue: number }[];
};

export async function adminRequest<R>(path: string, init?: RequestInit): Promise<R> {
  const token = getToken();
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init?.headers,
    },
  });
  if (res.status === 401) {
    clearToken();
    if (typeof window !== "undefined") window.location.href = "/admin/login";
    throw new ApiError(401, "Session expired");
  }
  if (res.status === 204) return undefined as R;
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError(res.status, json.message ?? "Request failed", json.errors);
  return json as R;
}

export async function adminLogin(email: string, password: string) {
  const res = await fetch(`${BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError(res.status, json.message ?? "Login failed");
  return json as { token: string; admin: AdminUser };
}

export const getMe = () => adminRequest<{ admin: AdminUser }>("/auth/me").then((r) => r.admin);
export const getStats = () => adminRequest<{ data: Stats }>("/admin/stats").then((r) => r.data);

export type AdminOrder = {
  id: number;
  orderNumber: string;
  status: string;
  paymentMethod: string;
  isPaid: boolean;
  customerName: string;
  phone: string;
  email: string | null;
  deliveryType: "DELIVERY" | "PICKUP";
  wilaya: string | null;
  address: string | null;
  deliveryDate: string | null;
  timeWindow: "MORNING" | "AFTERNOON" | "EVENING" | null;
  isGift: boolean;
  giftMessage: string | null;
  notes: string | null;
  couponCode: string | null;
  subtotal: number;
  discount: number;
  deliveryFee: number;
  total: number;
  createdAt: string;
  items?: {
    id: number;
    productName: string;
    variantLabel: string;
    unitPrice: number;
    quantity: number;
    inscription: string | null;
  }[];
};

const qs = (p: Record<string, string | number | undefined>) => {
  const s = new URLSearchParams();
  Object.entries(p).forEach(([k, v]) => v !== undefined && v !== "" && s.set(k, String(v)));
  const out = s.toString();
  return out ? `?${out}` : "";
};

export const getOrders = (q: { status?: string; search?: string; page?: number; limit?: number }) =>
  adminRequest<{ data: AdminOrder[]; meta: Meta }>(`/admin/orders${qs(q)}`);

export const getOrder = (id: number) =>
  adminRequest<{ data: AdminOrder }>(`/admin/orders/${id}`).then((r) => r.data);

export const setOrderStatus = (id: number, status: string) =>
  adminRequest(`/admin/orders/${id}/status`, { method: "PATCH", body: JSON.stringify({ status }) });

export const setOrderPaid = (id: number, isPaid: boolean) =>
  adminRequest(`/admin/orders/${id}/paid`, { method: "PATCH", body: JSON.stringify({ isPaid }) });