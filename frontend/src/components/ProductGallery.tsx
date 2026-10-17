"use client";

import Image from "next/image";
import { useState } from "react";
import { Flower2 } from "lucide-react";

export type GalleryImage = { id: number; url: string; alt?: string | null };

export default function ProductGallery({
  images,
  name,
  badge,
}: {
  images: GalleryImage[];
  name: string;
  badge?: string;
}) {
  const [index, setIndex] = useState(0);
  const current = images[index];

  return (
    <div className="space-y-3">
      <div className="relative aspect-square overflow-hidden rounded-2xl border border-line bg-sand">
        {current ? (
          <Image
            src={current.url}
            alt={current.alt ?? name}
            fill
            priority
            sizes="(min-width:1024px) 50vw, 100vw"
            className="object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-berry/40">
            <Flower2 size={64} />
          </div>
        )}
        {badge && (
          <span className="absolute left-4 top-4 rounded-full bg-white/95 px-3 py-1 text-xs font-semibold text-cocoa shadow-warm">
            {badge}
          </span>
        )}
      </div>

      {images.length > 1 && (
        <div className="grid grid-cols-4 gap-3">
          {images.map((img, i) => (
            <button
              key={img.id}
              onClick={() => setIndex(i)}
              aria-label={`Show image ${i + 1}`}
              className={`relative aspect-square overflow-hidden rounded-xl border-2 bg-sand transition-colors ${
                i === index ? "border-berry" : "border-transparent hover:border-line"
              }`}
            >
              <Image src={img.url} alt="" fill sizes="120px" className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}