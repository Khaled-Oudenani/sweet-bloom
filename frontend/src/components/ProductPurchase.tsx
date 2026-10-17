"use client";

import { useState } from "react";
import { Minus, Plus, ShoppingBag, Truck } from "lucide-react";
import type { ProductDetail } from "@/lib/api";
import { formatDA } from "@/lib/format";
import { useCart } from "@/store/cart";

export default function ProductPurchase({ product }: { product: ProductDetail }) {
  const addItem = useCart((s) => s.addItem);
  const initial = product.variants.find((v) => v.stock > 0) ?? product.variants[0];
  const [variantId, setVariantId] = useState(initial?.id);
  const [inscription, setInscription] = useState("");
  const [qty, setQty] = useState(1);

  const variant = product.variants.find((v) => v.id === variantId);
  const maxQty = variant ? Math.max(1, Math.min(20, variant.stock)) : 1;
  const soldOut = !variant || variant.stock <= 0;
  const showInscription = product.category.slug === "cakes";

  function selectVariant(id: number) {
    setVariantId(id);
    setQty(1);
  }

  function add() {
    if (!variant || soldOut) return;
    addItem({
      variantId: variant.id,
      productId: product.id,
      slug: product.slug,
      name: product.name,
      variantLabel: variant.label,
      price: variant.price,
      image: product.imageUrl ?? undefined,
      quantity: qty,
      inscription: showInscription && inscription.trim() ? inscription.trim() : undefined,
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-baseline gap-3">
        <p className="text-3xl font-bold text-cocoa">{variant ? formatDA(variant.price) : "—"}</p>
        <span className="text-xs text-cocoa-muted">Settlement via Cash on Delivery</span>
      </div>

      <p className="leading-7">{product.description ?? product.shortDescription}</p>

      {product.variants.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-cocoa">
              {product.variants.length > 1 ? "Select size & servings" : "Format"}
            </p>
            {variant?.serves && <span className="text-xs font-semibold text-berry">Serves {variant.serves}</span>}
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {product.variants.map((v) => {
              const active = v.id === variantId;
              const out = v.stock <= 0;
              return (
                <button
                  key={v.id}
                  disabled={out}
                  onClick={() => selectVariant(v.id)}
                  className={`rounded-xl border-[1.5px] p-3 text-left transition-colors ${
                    active ? "border-berry bg-blush/60" : "border-line bg-white hover:border-berry"
                  } ${out ? "cursor-not-allowed opacity-50" : ""}`}
                >
                  <span className="block text-sm font-bold text-cocoa">{v.label}</span>
                  {v.serves && <span className="block text-xs text-cocoa-muted">{v.serves}</span>}
                  <span className="mt-1 block text-sm font-bold text-berry">
                    {out ? "Sold out" : formatDA(v.price)}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {showInscription && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label htmlFor="inscription" className="text-[11px] font-semibold uppercase tracking-widest text-cocoa">
              Piped message plaque <span className="font-normal normal-case text-cocoa-muted">(optional)</span>
            </label>
            <span className="text-[11px] font-semibold text-berry">Free of charge</span>
          </div>
          <input
            id="inscription"
            value={inscription}
            maxLength={100}
            onChange={(e) => setInscription(e.target.value)}
            placeholder="e.g. Joyeux Anniversaire Amira, Mabrouk..."
            className="h-11 w-full rounded-2xl border-[1.5px] border-line bg-white px-4 text-sm outline-none focus:border-berry focus:ring-[3px] focus:ring-blush"
          />
        </div>
      )}

      <div className="flex gap-3">
        <div className="flex h-12 items-center rounded-full bg-sand px-2">
          <button aria-label="Decrease quantity" onClick={() => setQty((q) => Math.max(1, q - 1))}
            className="flex h-8 w-8 items-center justify-center text-berry">
            <Minus size={16} />
          </button>
          <span className="w-8 text-center text-sm font-bold text-cocoa">{qty}</span>
          <button aria-label="Increase quantity" disabled={qty >= maxQty}
            onClick={() => setQty((q) => Math.min(maxQty, q + 1))}
            className="flex h-8 w-8 items-center justify-center text-berry disabled:opacity-40">
            <Plus size={16} />
          </button>
        </div>
        <button
          onClick={add}
          disabled={soldOut}
          className="flex h-12 flex-1 items-center justify-center gap-2 rounded-full bg-berry text-sm font-semibold text-white transition-colors hover:bg-berry-dark disabled:cursor-not-allowed disabled:opacity-50"
        >
          <ShoppingBag size={18} />
          {soldOut ? "Sold out" : `Add to Basket — ${formatDA(variant!.price * qty)}`}
        </button>
      </div>

      <p className="flex items-start gap-2 rounded-xl bg-pistachio/60 p-3 text-xs text-pistachio-ink">
        <Truck size={16} className="mt-0.5 shrink-0" />
        Order before 11:00 for same-day delivery in Laghouat. Pay Cash on Delivery.
      </p>
    </div>
  );
}