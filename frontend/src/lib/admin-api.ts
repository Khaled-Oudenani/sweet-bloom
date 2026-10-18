import { ApiError } from "@/lib/api";

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