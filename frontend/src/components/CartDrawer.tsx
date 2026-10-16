"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Minus, Plus, ShoppingBag, Trash2, X } from "lucide-react";
import { useCart } from "@/store/cart";
import { formatDA } from "@/lib/format";

export default function CartDrawer() {
  const { items, isOpen, closeCart, setQuantity, removeItem } = useCart();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // Escape + قفل scroll الخلفية
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && closeCart();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [isOpen, closeCart]);

  if (!mounted) return null;

  const count = items.reduce((n, i) => n + i.quantity, 0);
  const subtotal = items.reduce((n, i) => n + i.price * i.quantity, 0);

  return (
    <>
      <div
        onClick={closeCart}
        className={`fixed inset-0 z-50 bg-cocoa/40 transition-opacity ${
          isOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />
      <aside
        aria-hidden={!isOpen}
        className={`fixed right-0 top-0 z-50 flex h-full w-full flex-col bg-cream shadow-warm transition-transform duration-300 sm:w-[420px] ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <div className="flex items-center gap-2">
            <h2 className="font-display text-xl text-cocoa">Your Basket</h2>
            {count > 0 && (
              <span className="rounded-full bg-berry px-2 py-0.5 text-xs font-bold text-white">
                {count} {count === 1 ? "item" : "items"}
              </span>
            )}
          </div>
          <button onClick={closeCart} aria-label="Close basket"
            className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-sand">
            <X size={20} />
          </button>
        </div>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-8 text-center">
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-blush text-berry">
              <ShoppingBag size={28} />
            </span>
            <p className="font-display text-lg text-cocoa">Your basket is empty</p>
            <p className="text-sm">Add a few fresh bakes and they will appear here.</p>
            <Link href="/shop" onClick={closeCart}
              className="rounded-full bg-berry px-6 py-3 text-sm font-semibold text-white hover:bg-berry-dark">
              Browse the shop
            </Link>
          </div>
        ) : (
          <>
            <ul className="flex-1 space-y-3 overflow-y-auto p-5">
              {items.map((item) => (
                <li key={`${item.variantId}|${item.inscription ?? ""}`}
                  className="flex gap-3 rounded-2xl border border-line bg-white p-3">
                  <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-sand">
                    {item.image && (
                      <Image src={item.image} alt={item.name} fill sizes="80px" className="object-cover" />
                    )}
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col justify-between">
                    <div>
                      <Link href={`/shop/${item.slug}`} onClick={closeCart}
                        className="line-clamp-1 font-display text-base text-cocoa hover:text-berry">
                        {item.name}
                      </Link>
                      <p className="text-xs text-cocoa-muted">{item.variantLabel}</p>
                      {item.inscription && (
                        <p className="mt-1 line-clamp-1 text-xs italic text-berry">
                          Plaque: “{item.inscription}”
                        </p>
                      )}
                    </div>
                    <div className="mt-2 flex items-center justify-between">
                      <div className="flex items-center gap-1 rounded-full bg-sand px-1">
                        <button aria-label="Decrease"
                          onClick={() => setQuantity(item.variantId, item.inscription, item.quantity - 1)}
                          className="flex h-7 w-7 items-center justify-center text-berry">
                          <Minus size={14} />
                        </button>
                        <span className="w-5 text-center text-sm font-bold text-cocoa">{item.quantity}</span>
                        <button aria-label="Increase" disabled={item.quantity >= 20}
                          onClick={() => setQuantity(item.variantId, item.inscription, item.quantity + 1)}
                          className="flex h-7 w-7 items-center justify-center text-berry disabled:opacity-40">
                          <Plus size={14} />
                        </button>
                      </div>
                      <span className="text-sm font-bold text-cocoa">
                        {formatDA(item.price * item.quantity)}
                      </span>
                    </div>
                  </div>
                  <button aria-label="Remove" onClick={() => removeItem(item.variantId, item.inscription)}
                    className="self-start text-cocoa-muted hover:text-danger">
                    <Trash2 size={16} />
                  </button>
                </li>
              ))}
            </ul>

            <div className="space-y-3 border-t border-line bg-sand p-5">
              <div className="flex items-center justify-between">
                <span className="text-sm">Subtotal</span>
                <span className="text-lg font-bold text-cocoa">{formatDA(subtotal)}</span>
              </div>
              <p className="text-xs text-cocoa-muted">
                Delivery fee and discounts are calculated at checkout. Settlement via Cash on Delivery.
              </p>
              <Link href="/checkout" onClick={closeCart}
                className="flex h-12 w-full items-center justify-center rounded-full bg-berry text-sm font-semibold text-white transition-colors hover:bg-berry-dark">
                Proceed to Guest Checkout
              </Link>
            </div>
          </>
        )}
      </aside>
    </>
  );
}