"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { ImagePlus, Star, Trash2 } from "lucide-react";
import { ApiError } from "@/lib/api";
import { deleteProductImage, setCoverImage, uploadProductImage, type AdminProductDetail } from "@/lib/admin-api";

const MAX = 5 * 1024 * 1024;
const TYPES = ["image/jpeg", "image/png", "image/webp"];

export default function ProductImages({ product, onChange }: { product: AdminProductDetail; onChange: () => Promise<void> | void }) {
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function run(action: () => Promise<unknown>) {
    setBusy(true);
    setError("");
    try {
      await action();
      await onChange();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Action failed");
    } finally {
      setBusy(false);
    }
  }

  async function onFiles(files: FileList | null) {
    if (!files?.length) return;
    const list = Array.from(files);
    const bad = list.find((f) => !TYPES.includes(f.type) || f.size > MAX);
    if (bad) {
      setError(`"${bad.name}": only JPG, PNG or WebP up to 5 MB.`);
      return;
    }
    await run(async () => {
      for (const f of list) await uploadProductImage(product.id, f, product.name); // بالتسلسل
    });
    if (input.current) input.current.value = "";
  }

  const cover = product.imageUrl;

  return (
    <section className="space-y-4 rounded-2xl border border-line bg-white p-5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-display text-xl text-cocoa">Images</h2>
        <button type="button" disabled={busy} onClick={() => input.current?.click()}
          className="flex items-center gap-2 rounded-full bg-blush px-4 py-2 text-sm font-semibold text-berry hover:bg-blush-dark disabled:opacity-60">
          <ImagePlus size={16} /> {busy ? "Working..." : "Upload images"}
        </button>
        <input ref={input} type="file" accept="image/jpeg,image/png,image/webp" multiple hidden onChange={(e) => onFiles(e.target.files)} />
      </div>
      <p className="text-xs text-cocoa-muted">JPG, PNG or WebP, max 5 MB each. The first image becomes the cover automatically.</p>
      {error && <p className="rounded-xl bg-danger/10 p-3 text-xs text-danger">{error}</p>}

      {product.images.length === 0 ? (
        <p className="rounded-xl bg-sand p-6 text-center text-sm text-cocoa-muted">No images yet.</p>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {product.images.map((img) => {
            const isCover = img.isCover ?? img.url === cover;
            return (
              <div key={img.id} className={`overflow-hidden rounded-xl border-2 ${isCover ? "border-berry" : "border-line"}`}>
                <div className="relative aspect-square bg-sand">
                  <Image src={img.url} alt={img.alt ?? product.name} fill sizes="200px" className="object-cover" />
                  {isCover && <span className="absolute left-2 top-2 rounded-full bg-berry px-2 py-0.5 text-[10px] font-bold text-white">COVER</span>}
                </div>
                <div className="flex justify-between bg-white p-2">
                  <button type="button" disabled={busy || isCover} onClick={() => run(() => setCoverImage(product.id, img.id))}
                    className="flex items-center gap-1 text-xs font-semibold text-berry disabled:opacity-40">
                    <Star size={14} /> Cover
                  </button>
                  <button type="button" disabled={busy}
                    onClick={() => confirm("Delete this image?") && run(() => deleteProductImage(product.id, img.id))}
                    className="text-danger disabled:opacity-40" aria-label="Delete image">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}