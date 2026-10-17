"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CheckCircle2 } from "lucide-react";
import type { Order } from "@/lib/api";
import { formatDA } from "@/lib/format";

export default function OrderConfirmedPage() {
  const [order, setOrder] = useState<Order | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("sb-last-order");
      if (raw) setOrder(JSON.parse(raw));
    } catch {}
    setReady(true);
  }, []);

  if (!ready) return null;

  if (!order) {
    return (
      <div className="mx-auto max-w-xl space-y-4 px-5 py-20 text-center">
        <p className="font-display text-2xl text-cocoa">No recent order found</p>
        <Link href="/shop" className="inline-block rounded-full bg-berry px-6 py-3 text-sm font-semibold text-white hover:bg-berry-dark">
          Browse the shop
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl space-y-6 px-5 py-12">
      <div className="space-y-3 text-center">
        <CheckCircle2 size={56} className="mx-auto text-success" />
        <h1 className="font-display text-[32px] font-semibold text-cocoa">Thank you for your order!</h1>
        <p className="text-sm">
          Order number <b className="text-berry">{order.orderNumber}</b>. We will contact you shortly to confirm.
        </p>
      </div>

      <div className="space-y-4 rounded-2xl border border-line bg-white p-5">
        <ul className="divide-y divide-line">
          {order.items.map((it, i) => (
            <li key={i} className="flex justify-between gap-3 py-2 text-sm">
              <span>
                {it.quantity}× <b className="text-cocoa">{it.productName}</b>
                <span className="text-cocoa-muted"> ({it.variantLabel})</span>
                {it.inscription && <span className="block text-xs italic text-berry">Plaque: “{it.inscription}”</span>}
              </span>
              <span className="font-semibold text-cocoa">{formatDA(it.unitPrice * it.quantity)}</span>
            </li>
          ))}
        </ul>
        <dl className="space-y-1.5 border-t border-line pt-3 text-sm">
          <div className="flex justify-between"><dt>Subtotal</dt><dd>{formatDA(order.subtotal)}</dd></div>
          {order.discount > 0 && <div className="flex justify-between text-success"><dt>Discount</dt><dd>-{formatDA(order.discount)}</dd></div>}
          <div className="flex justify-between"><dt>Delivery</dt><dd>{order.deliveryFee === 0 ? "Free" : formatDA(order.deliveryFee)}</dd></div>
          <div className="flex justify-between border-t border-line pt-2 text-base font-bold text-cocoa">
            <dt>Total to pay in cash</dt><dd className="text-berry">{formatDA(order.total)}</dd>
          </div>
        </dl>
      </div>

      <div className="text-center">
        <Link href="/shop" className="inline-block rounded-full bg-berry px-7 py-3 text-sm font-semibold text-white hover:bg-berry-dark">
          Continue shopping
        </Link>
      </div>
    </div>
  );
}