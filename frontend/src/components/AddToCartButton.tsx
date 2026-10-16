"use client";

import { useCart } from "@/store/cart";
import type { Product } from "@/lib/api";

export default function AddToCartButton({ product }: { product: Product }) {
  const addItem = useCart((s) => s.addItem);
  const variant = product.variants.find((v) => v.stock > 0);

  if (!variant) {
    return (
      <span className="rounded-full bg-sand px-4 py-2 text-xs font-semibold text-cocoa-muted">
        Sold out
      </span>
    );
  }

  return (
    <button
      onClick={() =>
        addItem({
          variantId: variant.id,
          productId: product.id,
          slug: product.slug,
          name: product.name,
          variantLabel: variant.label,
          price: variant.price,
          image: product.imageUrl ?? undefined,
          quantity: 1,
        })
      }
      className="rounded-full bg-blush px-4 py-2 text-xs font-semibold text-berry transition-colors hover:bg-blush-dark"
    >
      Add
    </button>
  );
}