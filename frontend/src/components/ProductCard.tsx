import Image from "next/image";
import Link from "next/link";
import { Flower2, Star } from "lucide-react";
import type { Product } from "@/lib/api";
import { formatDA } from "@/lib/format";
import AddToCartButton from "./AddToCartButton";
import { BADGES } from "@/lib/badges";

export default function ProductCard({ product: p }: { product: Product }) {
  const hasSizes = p.variants.length > 1;

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-line bg-white transition-all duration-300 hover:-translate-y-0.5 hover:shadow-bloom">
      <Link href={`/shop/${p.slug}`} className="flex flex-1 flex-col">
        <div className="relative aspect-square overflow-hidden bg-sand">
          {p.imageUrl ? (
            <Image
              src={p.imageUrl}
              alt={p.name}
              fill
              sizes="(min-width:1024px) 25vw, (min-width:640px) 50vw, 100vw"
              className="object-cover transition-transform duration-[400ms] group-hover:scale-[1.03]"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-berry/40">
              <Flower2 size={48} />
            </div>
          )}
          {p.badge && (
            <span className="absolute left-3 top-3 rounded-full bg-caramel px-3 py-1 text-[11px] font-semibold text-cocoa">
              {BADGES[p.badge] ?? p.badge}
            </span>
          )}
          {p.reviewCount > 0 && (
            <span className="absolute bottom-3 right-3 flex items-center gap-1 rounded-full bg-white/90 px-2 py-1 text-xs font-bold text-cocoa">
              <Star size={12} className="fill-caramel text-caramel" /> {p.rating.toFixed(1)}
            </span>
          )}
        </div>

        <div className="flex flex-1 flex-col gap-2 p-4">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-cocoa-muted">
            {p.category.name}
          </p>
          <h3 className="font-display text-lg leading-snug text-cocoa">{p.name}</h3>
          {p.shortDescription && (
            <p className="line-clamp-2 text-sm">{p.shortDescription}</p>
          )}
          {p.dietaryTags.length > 0 && (
            <div className="mt-auto flex flex-wrap gap-1.5 pt-1">
              {p.dietaryTags.slice(0, 2).map((t) => (
                <span key={t.id}
                  className="rounded-full bg-pistachio px-3 py-1 text-[11px] font-semibold text-pistachio-ink">
                  {t.name}
                </span>
              ))}
            </div>
          )}
        </div>
      </Link>

      <div className="flex items-center justify-between px-4 pb-4">
        <div>
          {hasSizes && <p className="text-[11px] text-cocoa-muted">From</p>}
          <p className="text-base font-bold text-cocoa">{formatDA(p.basePrice)}</p>
        </div>
        <AddToCartButton product={p} />
      </div>
    </article>
  );
}