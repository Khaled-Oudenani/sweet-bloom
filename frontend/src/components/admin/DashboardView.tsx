"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ApiError } from "@/lib/api";
import { getStats, type Stats } from "@/lib/admin-api";
import { formatDA } from "@/lib/format";
import StatusBadge from "./StatusBadge";

const card = "rounded-2xl border border-line bg-white p-5";

function Kpi({ label, value, href, accent }: { label: string; value: string | number; href?: string; accent?: boolean }) {
  const body = (
    <div className={`${card} ${accent ? "border-berry/40 bg-blush/40" : ""} h-full transition-shadow hover:shadow-warm`}>
      <p className="text-xs font-semibold text-cocoa-muted">{label}</p>
      <p className="mt-1 font-display text-3xl font-semibold text-cocoa">{value}</p>
    </div>
  );
  return href ? <Link href={href}>{body}</Link> : body;
}

export default function DashboardView() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    getStats()
      .then(setStats)
      .catch((e) => setError(e instanceof ApiError ? e.message : "Could not load stats"));
  }, []);

  if (error) return <p className="rounded-xl bg-danger/10 p-4 text-sm text-danger">{error}</p>;
  if (!stats) return <div className="h-96 animate-pulse rounded-2xl bg-sand" />;

  const maxRevenue = Math.max(1, ...stats.dailySales.map((d) => d.revenue));

  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl font-semibold text-cocoa">Dashboard</h1>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Kpi label="Orders today" value={stats.ordersToday} />
        <Kpi label="Pending orders" value={stats.pendingOrders} href="/admin/orders" accent={stats.pendingOrders > 0} />
        <Kpi label="Reviews to approve" value={stats.pendingReviews} href="/admin/reviews" accent={stats.pendingReviews > 0} />
        <Kpi label="New custom requests" value={stats.newCustomRequests} href="/admin/custom-requests" accent={stats.newCustomRequests > 0} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Kpi label="Delivered revenue (30 days)" value={formatDA(stats.revenueDelivered30d)} />
        <Kpi label="In pipeline (not yet delivered)" value={formatDA(stats.revenuePipeline)} />
      </div>

      <section className={card}>
        <h2 className="mb-4 font-display text-xl text-cocoa">Sales — last 14 days</h2>
        <div className="flex h-40 items-end gap-1.5">
          {stats.dailySales.map((d) => (
            <div key={d.day} className="flex flex-1 flex-col items-center gap-1" title={`${d.day}: ${formatDA(d.revenue)} • ${d.orders} orders`}>
              <div className="flex w-full flex-1 items-end">
                <div className="w-full rounded-t-md bg-berry/80" style={{ height: `${Math.max(2, (d.revenue / maxRevenue) * 100)}%` }} />
              </div>
              <span className="text-[10px] text-cocoa-muted">{d.day.slice(8)}</span>
            </div>
          ))}
        </div>
      </section>

      <div className="grid gap-4 lg:grid-cols-3">
        <section className={card}>
          <h2 className="mb-3 font-display text-xl text-cocoa">Orders by status</h2>
          <ul className="space-y-2">
            {Object.entries(stats.ordersByStatus).length === 0 && <li className="text-sm text-cocoa-muted">No orders yet.</li>}
            {Object.entries(stats.ordersByStatus).map(([s, n]) => (
              <li key={s} className="flex items-center justify-between"><StatusBadge status={s} /><b className="text-cocoa">{n}</b></li>
            ))}
          </ul>
        </section>

        <section className={card}>
          <h2 className="mb-3 font-display text-xl text-cocoa">Top products</h2>
          <ol className="space-y-2 text-sm">
            {stats.topProducts.length === 0 && <li className="text-cocoa-muted">No sales yet.</li>}
            {stats.topProducts.map((p, i) => (
              <li key={p.productId} className="flex justify-between gap-3">
                <span className="truncate">{i + 1}. {p.name}</span><b className="text-cocoa">{p.sold} sold</b>
              </li>
            ))}
          </ol>
        </section>

        <section className={card}>
          <h2 className="mb-3 font-display text-xl text-cocoa">Low stock</h2>
          <ul className="space-y-2 text-sm">
            {stats.lowStock.length === 0 && <li className="text-cocoa-muted">All variants are well stocked.</li>}
            {stats.lowStock.map((v) => (
              <li key={v.id} className="flex justify-between gap-3">
                <span className="truncate">{v.product.name} <span className="text-cocoa-muted">({v.label})</span></span>
                <b className={v.stock === 0 ? "text-danger" : "text-cocoa"}>{v.stock}</b>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <section className={`${card} overflow-x-auto`}>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-display text-xl text-cocoa">Recent orders</h2>
          <Link href="/admin/orders" className="text-xs font-semibold text-berry">View all</Link>
        </div>
        <table className="w-full min-w-[520px] text-left text-sm">
          <thead className="text-xs text-cocoa-muted">
            <tr><th className="pb-2">Order</th><th className="pb-2">Customer</th><th className="pb-2">Total</th><th className="pb-2">Status</th><th className="pb-2">Date</th></tr>
          </thead>
          <tbody className="divide-y divide-line">
            {stats.recentOrders.map((o) => (
              <tr key={o.id}>
                <td className="py-2 font-semibold text-cocoa">{o.orderNumber}</td>
                <td className="py-2">{o.customerName}</td>
                <td className="py-2">{formatDA(o.total)}</td>
                <td className="py-2"><StatusBadge status={o.status} /></td>
                <td className="py-2 text-xs text-cocoa-muted">{new Date(o.createdAt).toLocaleString("en-GB", { dateStyle: "short", timeStyle: "short" })}</td>
              </tr>
            ))}
            {stats.recentOrders.length === 0 && <tr><td colSpan={5} className="py-4 text-cocoa-muted">No orders yet.</td></tr>}
          </tbody>
        </table>
      </section>
    </div>
  );
}