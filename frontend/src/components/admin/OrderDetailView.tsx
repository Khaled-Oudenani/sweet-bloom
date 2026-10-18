"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { ArrowLeft, MessageCircle, Phone } from "lucide-react";
import { ApiError } from "@/lib/api";
import { getOrder, setOrderPaid, setOrderStatus, type AdminOrder } from "@/lib/admin-api";
import { formatDA } from "@/lib/format";
import StatusBadge from "./StatusBadge";

const STATUSES = ["PENDING", "CONFIRMED", "PREPARING", "OUT_FOR_DELIVERY", "DELIVERED", "CANCELLED", "RETURNED"];
const NEXT: Record<string, string | undefined> = {
  PENDING: "CONFIRMED",
  CONFIRMED: "PREPARING",
  PREPARING: "OUT_FOR_DELIVERY",
  OUT_FOR_DELIVERY: "DELIVERED",
};
const WINDOWS = { MORNING: "Morning 09:00–12:00", AFTERNOON: "Afternoon 14:00–17:00", EVENING: "Evening 18:00–21:00" };

const card = "space-y-3 rounded-2xl border border-line bg-white p-5";
const label = (s: string) => s.replaceAll("_", " ");

function waLink(phone: string) {
  const digits = phone.replace(/\D/g, "");
  const intl = digits.startsWith("0") ? `213${digits.slice(1)}` : digits;
  return `https://wa.me/${intl}`;
}

export default function OrderDetailView() {
  const { id } = useParams<{ id: string }>();
  const orderId = Number(id);

  const [order, setOrder] = useState<AdminOrder | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [target, setTarget] = useState("");

  const load = useCallback(async () => {
    try {
      const o = await getOrder(orderId);
      setOrder(o);
      setTarget(o.status);
      setError("");
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Could not load the order");
    }
  }, [orderId]);

  useEffect(() => {
    load();
  }, [load]);

  async function run(action: () => Promise<unknown>) {
    setBusy(true);
    setError("");
    try {
      await action();
      await load();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Action failed");
    } finally {
      setBusy(false);
    }
  }

  function changeStatus(status: string) {
    if (!order || status === order.status) return;
    if (status === "CANCELLED" && !confirm("Cancel this order? Stock will be restored and this can not be undone.")) return;
    run(() => setOrderStatus(order.id, status));
  }

  if (error && !order) return <p className="rounded-xl bg-danger/10 p-4 text-sm text-danger">{error}</p>;
  if (!order) return <div className="h-96 animate-pulse rounded-2xl bg-sand" />;

  const locked = order.status === "CANCELLED";
  const next = NEXT[order.status];

  return (
    <div className="space-y-5">
      <Link href="/admin/orders" className="inline-flex items-center gap-1 text-sm font-semibold text-berry">
        <ArrowLeft size={16} /> Back to orders
      </Link>

      <div className="flex flex-wrap items-center gap-3">
        <h1 className="font-display text-3xl font-semibold text-cocoa">{order.orderNumber}</h1>
        <StatusBadge status={order.status} />
        <span className={`rounded-full px-3 py-1 text-[11px] font-bold ${order.isPaid ? "bg-success/15 text-success" : "bg-sand text-cocoa-soft"}`}>
          {order.isPaid ? "PAID" : "UNPAID • COD"}
        </span>
        <span className="text-xs text-cocoa-muted">
          {new Date(order.createdAt).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" })}
        </span>
      </div>

      {error && <p className="rounded-xl bg-danger/10 p-3 text-sm text-danger">{error}</p>}

      <div className="grid gap-5 lg:grid-cols-[1fr_340px]">
        {/* left */}
        <div className="min-w-0 space-y-5">
          <section className={`${card} overflow-x-auto`}>
            <h2 className="font-display text-xl text-cocoa">Items</h2>
            <table className="w-full min-w-[420px] text-sm">
              <tbody className="divide-y divide-line">
                {order.items?.map((it) => (
                  <tr key={it.id}>
                    <td className="py-2.5">
                      <span className="font-semibold text-cocoa">{it.productName}</span>
                      <span className="text-cocoa-muted"> ({it.variantLabel})</span>
                      {it.inscription && <span className="block text-xs italic text-berry">Plaque: “{it.inscription}”</span>}
                    </td>
                    <td className="py-2.5 text-center">× {it.quantity}</td>
                    <td className="py-2.5 text-right">{formatDA(it.unitPrice)}</td>
                    <td className="py-2.5 text-right font-semibold text-cocoa">{formatDA(it.unitPrice * it.quantity)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <dl className="ml-auto max-w-xs space-y-1.5 border-t border-line pt-3 text-sm">
              <div className="flex justify-between"><dt>Subtotal</dt><dd>{formatDA(order.subtotal)}</dd></div>
              {order.discount > 0 && (
                <div className="flex justify-between text-success"><dt>Discount {order.couponCode && `(${order.couponCode})`}</dt><dd>-{formatDA(order.discount)}</dd></div>
              )}
              <div className="flex justify-between"><dt>Delivery</dt><dd>{order.deliveryFee === 0 ? "Free" : formatDA(order.deliveryFee)}</dd></div>
              <div className="flex justify-between border-t border-line pt-2 text-base font-bold text-cocoa"><dt>Total (COD)</dt><dd className="text-berry">{formatDA(order.total)}</dd></div>
            </dl>
          </section>

          {(order.notes || order.isGift) && (
            <section className={card}>
              <h2 className="font-display text-xl text-cocoa">Notes</h2>
              {order.isGift && (
                <p className="rounded-xl bg-blush/50 p-3 text-sm">
                  <b className="text-berry">Gift order.</b> {order.giftMessage ? `Card: “${order.giftMessage}”` : "No card message."}
                </p>
              )}
              {order.notes && <p className="text-sm">{order.notes}</p>}
            </section>
          )}
        </div>

        {/* right */}
        <div className="min-w-0 space-y-5">
          <section className={card}>
            <h2 className="font-display text-xl text-cocoa">Manage order</h2>
            {locked ? (
              <p className="text-sm text-cocoa-muted">This order is cancelled and can no longer be changed.</p>
            ) : (
              <>
                {next && (
                  <button disabled={busy} onClick={() => changeStatus(next)}
                    className="h-11 w-full rounded-full bg-berry text-sm font-semibold text-white hover:bg-berry-dark disabled:opacity-60">
                    Mark as {label(next)}
                  </button>
                )}
                <div className="flex gap-2">
                  <select value={target} onChange={(e) => setTarget(e.target.value)}
                    className="h-10 min-w-0 flex-1 rounded-full border-[1.5px] border-line bg-white px-3 text-sm outline-none focus:border-berry">
                    {STATUSES.map((s) => <option key={s} value={s}>{label(s)}</option>)}
                  </select>
                  <button disabled={busy || target === order.status} onClick={() => changeStatus(target)}
                    className="rounded-full bg-blush px-4 text-sm font-semibold text-berry hover:bg-blush-dark disabled:opacity-50">
                    Apply
                  </button>
                </div>
                <button disabled={busy} onClick={() => run(() => setOrderPaid(order.id, !order.isPaid))}
                  className="h-10 w-full rounded-full border border-line text-sm font-semibold text-cocoa hover:border-berry disabled:opacity-60">
                  {order.isPaid ? "Mark as unpaid" : "Mark as paid (cash collected)"}
                </button>
                <p className="text-[11px] text-cocoa-muted">Delivered marks the order as paid. Cancelling restores stock and releases the coupon.</p>
              </>
            )}
          </section>

          <section className={card}>
            <h2 className="font-display text-xl text-cocoa">Customer</h2>
            <p className="font-semibold text-cocoa">{order.customerName}</p>
            <p className="text-sm">{order.phone}</p>
            {order.email && <p className="break-all text-sm">{order.email}</p>}
            <div className="flex gap-2">
              <a href={`tel:${order.phone}`} className="flex flex-1 items-center justify-center gap-2 rounded-full bg-sand py-2 text-xs font-semibold text-cocoa hover:bg-blush">
                <Phone size={14} /> Call
              </a>
              <a href={waLink(order.phone)} target="_blank" rel="noopener noreferrer"
                className="flex flex-1 items-center justify-center gap-2 rounded-full bg-pistachio py-2 text-xs font-semibold text-pistachio-ink">
                <MessageCircle size={14} /> WhatsApp
              </a>
            </div>
          </section>

          <section className={card}>
            <h2 className="font-display text-xl text-cocoa">Fulfillment</h2>
            <p className="text-sm font-semibold text-cocoa">{order.deliveryType === "PICKUP" ? "Atelier pickup" : "Home delivery"}</p>
            {order.deliveryType === "DELIVERY" && (
              <p className="text-sm">{order.wilaya}<br />{order.address}</p>
            )}
            <p className="text-sm">
              {order.deliveryDate ? new Date(order.deliveryDate).toLocaleDateString("en-GB", { dateStyle: "full" }) : "No date requested"}
              {order.timeWindow && <><br />{WINDOWS[order.timeWindow]}</>}
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}