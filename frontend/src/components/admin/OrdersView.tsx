"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import type { Meta } from "@/lib/api";
import { ApiError } from "@/lib/api";
import { getOrders, type AdminOrder } from "@/lib/admin-api";
import { formatDA } from "@/lib/format";
import StatusBadge from "./StatusBadge";

const STATUSES = ["PENDING", "CONFIRMED", "PREPARING", "OUT_FOR_DELIVERY", "DELIVERED", "CANCELLED", "RETURNED"];

const chip = (active: boolean) =>
  `whitespace-nowrap rounded-full px-4 py-1.5 text-xs font-semibold transition-colors ${
    active ? "bg-berry text-white" : "bg-white border border-line text-cocoa hover:border-berry"
  }`;

export default function OrdersView() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const status = params.get("status") ?? "";
  const urlSearch = params.get("search") ?? "";
  const page = Number(params.get("page")) || 1;

  const [search, setSearch] = useState(urlSearch);
  const [orders, setOrders] = useState<AdminOrder[] | null>(null);
  const [meta, setMeta] = useState<Meta | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  function update(changes: Record<string, string | null>) {
    const next = new URLSearchParams(params.toString());
    Object.entries(changes).forEach(([k, v]) => (v ? next.set(k, v) : next.delete(k)));
    const q = next.toString();
    router.replace(q ? `${pathname}?${q}` : pathname, { scroll: false });
  }

  // debounce للبحث
  useEffect(() => {
    const t = setTimeout(() => {
      if (search.trim() !== urlSearch) update({ search: search.trim() || null, page: null });
    }, 400);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getOrders({ status: status || undefined, search: urlSearch || undefined, page, limit: 15 })
      .then((r) => {
        if (cancelled) return;
        setOrders(r.data);
        setMeta(r.meta);
        setError("");
      })
      .catch((e) => !cancelled && setError(e instanceof ApiError ? e.message : "Could not load orders"))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [status, urlSearch, page]);

  return (
    <div className="space-y-5">
      <h1 className="font-display text-3xl font-semibold text-cocoa">Orders</h1>

      <div className="relative max-w-md">
        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-cocoa-muted" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Order number, name or phone..."
          className="h-11 w-full rounded-full border-[1.5px] border-line bg-white pl-11 pr-4 text-sm outline-none focus:border-berry focus:ring-[3px] focus:ring-blush"
        />
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        <button className={chip(!status)} onClick={() => update({ status: null, page: null })}>All</button>
        {STATUSES.map((s) => (
          <button key={s} className={chip(status === s)} onClick={() => update({ status: s, page: null })}>
            {s.replaceAll("_", " ")}
          </button>
        ))}
      </div>

      {error && <p className="rounded-xl bg-danger/10 p-4 text-sm text-danger">{error}</p>}

      <div className={`overflow-x-auto rounded-2xl border border-line bg-white ${loading ? "opacity-60" : ""}`}>
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="bg-sand text-xs text-cocoa-muted">
            <tr>
              <th className="p-3">Order</th>
              <th className="p-3">Customer</th>
              <th className="p-3">Fulfillment</th>
              <th className="p-3">Total</th>
              <th className="p-3">Status</th>
              <th className="p-3">Payment</th>
              <th className="p-3">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {orders?.map((o) => (
              <tr key={o.id} className="hover:bg-cream">
                <td className="p-3">
                  <Link href={`/admin/orders/${o.id}`} className="font-semibold text-berry hover:underline">{o.orderNumber}</Link>
                </td>
                <td className="p-3">
                  <span className="block font-semibold text-cocoa">{o.customerName}</span>
                  <span className="text-xs text-cocoa-muted">{o.phone}</span>
                </td>
                <td className="p-3 text-xs">{o.deliveryType === "PICKUP" ? "Pickup" : `Delivery • ${o.wilaya ?? ""}`}</td>
                <td className="p-3 font-semibold text-cocoa">{formatDA(o.total)}</td>
                <td className="p-3"><StatusBadge status={o.status} /></td>
                <td className="p-3">
                  <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${o.isPaid ? "bg-success/15 text-success" : "bg-sand text-cocoa-soft"}`}>
                    {o.isPaid ? "PAID" : "UNPAID"}
                  </span>
                </td>
                <td className="p-3 text-xs text-cocoa-muted">
                  {new Date(o.createdAt).toLocaleString("en-GB", { dateStyle: "short", timeStyle: "short" })}
                </td>
              </tr>
            ))}
            {orders && orders.length === 0 && (
              <tr><td colSpan={7} className="p-8 text-center text-cocoa-muted">No orders found.</td></tr>
            )}
            {!orders && !error && (
              <tr><td colSpan={7} className="p-8 text-center text-cocoa-muted">Loading...</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {meta && meta.totalPages > 1 && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-cocoa-muted">Page {meta.page} of {meta.totalPages} • {meta.total} orders</span>
          <div className="flex gap-2">
            <button disabled={page <= 1} onClick={() => update({ page: String(page - 1) })}
              className="rounded-full border border-line bg-white px-4 py-2 font-semibold disabled:opacity-40">Previous</button>
            <button disabled={page >= meta.totalPages} onClick={() => update({ page: String(page + 1) })}
              className="rounded-full border border-line bg-white px-4 py-2 font-semibold disabled:opacity-40">Next</button>
          </div>
        </div>
      )}
    </div>
  );
}