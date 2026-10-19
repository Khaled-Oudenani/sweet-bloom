"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { Flower2, ImagePlus, Pencil, Plus, Trash2 } from "lucide-react";
import { ApiError } from "@/lib/api";
import {
  createCategory, deleteCategory, getAdminCategoriesFull, updateCategory, uploadGenericImage,
  type AdminCategory,
} from "@/lib/admin-api";

const inputCls =
  "h-11 w-full rounded-2xl border-[1.5px] border-line bg-white px-4 text-sm outline-none focus:border-berry focus:ring-[3px] focus:ring-blush";

type Draft = { id?: number; name: string; slug: string; description: string; imageUrl: string; sortOrder: string; isActive: boolean };
const empty: Draft = { name: "", slug: "", description: "", imageUrl: "", sortOrder: "0", isActive: true };

export default function CategoriesView() {
  const [items, setItems] = useState<AdminCategory[] | null>(null);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const file = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    try {
      setItems(await getAdminCategoriesFull());
      setError("");
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Could not load categories");
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const count = (c: AdminCategory) => c._count?.products ?? c.productCount ?? 0;

  function edit(c: AdminCategory) {
    setDraft({
      id: c.id, name: c.name, slug: c.slug, description: c.description ?? "",
      imageUrl: c.imageUrl ?? "", sortOrder: String(c.sortOrder ?? 0), isActive: c.isActive,
    });
    setError("");
  }

  async function pickImage(f: File | undefined) {
    if (!f || !draft) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(f.type) || f.size > 5 * 1024 * 1024) {
      setError("Only JPG, PNG or WebP up to 5 MB.");
      return;
    }
    setBusy(true);
    try {
      const { url } = await uploadGenericImage(f);
      setDraft({ ...draft, imageUrl: url });
      setError("");
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Upload failed");
    } finally {
      setBusy(false);
      if (file.current) file.current.value = "";
    }
  }

  async function save(ev: React.FormEvent) {
    ev.preventDefault();
    if (!draft) return;
    if (draft.name.trim().length < 2) return setError("Name is required");
    const sortOrder = Number(draft.sortOrder);
    if (!Number.isInteger(sortOrder)) return setError("Sort order must be a whole number");

    const body = {
      name: draft.name.trim(),
      slug: draft.slug.trim() || undefined,
      description: draft.description.trim() || undefined,
      imageUrl: draft.imageUrl || undefined,
      sortOrder,
      isActive: draft.isActive,
    };
    setBusy(true);
    try {
      if (draft.id) await updateCategory(draft.id, body);
      else await createCategory(body);
      setDraft(null);
      setError("");
      await load();
    } catch (e) {
      setError(e instanceof ApiError ? (e.status === 409 ? "This name or slug already exists." : e.message) : "Save failed");
    } finally {
      setBusy(false);
    }
  }

  async function remove(c: AdminCategory) {
    const msg = count(c) > 0
      ? `"${c.name}" has ${count(c)} products, so it will only be hidden. Continue?`
      : `Delete "${c.name}"?`;
    if (!confirm(msg)) return;
    try {
      await deleteCategory(c.id);
      await load();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Delete failed");
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-3xl font-semibold text-cocoa">Categories</h1>
        <button onClick={() => { setDraft(empty); setError(""); }}
          className="flex items-center gap-2 rounded-full bg-berry px-5 py-2.5 text-sm font-semibold text-white hover:bg-berry-dark">
          <Plus size={16} /> New category
        </button>
      </div>

      {error && <p className="rounded-xl bg-danger/10 p-3 text-sm text-danger">{error}</p>}

      {draft && (
        <form onSubmit={save} className="space-y-4 rounded-2xl border border-line bg-white p-5">
          <h2 className="font-display text-xl text-cocoa">{draft.id ? "Edit category" : "New category"}</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-1.5"><span className="text-xs font-semibold text-cocoa">Name *</span>
              <input className={inputCls} value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} /></label>
            <label className="space-y-1.5"><span className="text-xs font-semibold text-cocoa">Slug (optional)</span>
              <input className={inputCls} value={draft.slug} onChange={(e) => setDraft({ ...draft, slug: e.target.value })} /></label>
            <label className="space-y-1.5 sm:col-span-2"><span className="text-xs font-semibold text-cocoa">Description</span>
              <input className={inputCls} value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} /></label>
            <label className="space-y-1.5"><span className="text-xs font-semibold text-cocoa">Sort order</span>
              <input className={inputCls} inputMode="numeric" value={draft.sortOrder} onChange={(e) => setDraft({ ...draft, sortOrder: e.target.value })} /></label>
            <label className="flex items-center gap-3 self-end pb-3 text-sm font-semibold text-cocoa">
              <input type="checkbox" className="h-5 w-5 accent-berry" checked={draft.isActive} onChange={(e) => setDraft({ ...draft, isActive: e.target.checked })} />
              Visible in the shop
            </label>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative flex h-20 w-20 items-center justify-center overflow-hidden rounded-xl bg-sand text-berry/40">
              {draft.imageUrl ? <Image src={draft.imageUrl} alt="" fill sizes="80px" className="object-cover" /> : <Flower2 size={24} />}
            </div>
            <button type="button" disabled={busy} onClick={() => file.current?.click()}
              className="flex items-center gap-2 rounded-full bg-blush px-4 py-2 text-sm font-semibold text-berry hover:bg-blush-dark disabled:opacity-60">
              <ImagePlus size={16} /> {busy ? "Uploading..." : "Upload image"}
            </button>
            {draft.imageUrl && <button type="button" className="text-xs font-semibold text-danger" onClick={() => setDraft({ ...draft, imageUrl: "" })}>Remove</button>}
            <input ref={file} type="file" hidden accept="image/jpeg,image/png,image/webp" onChange={(e) => pickImage(e.target.files?.[0])} />
          </div>

          <div className="flex gap-3">
            <button disabled={busy} className="h-11 rounded-full bg-berry px-6 text-sm font-semibold text-white hover:bg-berry-dark disabled:opacity-60">Save</button>
            <button type="button" onClick={() => setDraft(null)} className="h-11 rounded-full border border-line bg-white px-6 text-sm font-semibold text-cocoa">Cancel</button>
          </div>
        </form>
      )}

      <div className="overflow-x-auto rounded-2xl border border-line bg-white">
        <table className="w-full min-w-[560px] text-left text-sm">
          <thead className="bg-sand text-xs text-cocoa-muted">
            <tr><th className="p-3">Category</th><th className="p-3">Products</th><th className="p-3">Order</th><th className="p-3">Status</th><th className="p-3" /></tr>
          </thead>
          <tbody className="divide-y divide-line">
            {items?.map((c) => (
              <tr key={c.id} className={c.isActive ? "" : "opacity-60"}>
                <td className="p-3">
                  <div className="flex items-center gap-3">
                    <div className="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-sand text-berry/40">
                      {c.imageUrl ? <Image src={c.imageUrl} alt="" fill sizes="40px" className="object-cover" /> : <Flower2 size={16} />}
                    </div>
                    <div><p className="font-semibold text-cocoa">{c.name}</p><p className="text-xs text-cocoa-muted">{c.slug}</p></div>
                  </div>
                </td>
                <td className="p-3">{count(c)}</td>
                <td className="p-3">{c.sortOrder}</td>
                <td className="p-3">
                  <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${c.isActive ? "bg-success/15 text-success" : "bg-line text-cocoa-soft"}`}>
                    {c.isActive ? "ACTIVE" : "HIDDEN"}
                  </span>
                </td>
                <td className="whitespace-nowrap p-3 text-right">
                  <button onClick={() => edit(c)} className="mr-3 text-berry" aria-label="Edit"><Pencil size={16} /></button>
                  <button onClick={() => remove(c)} className="text-danger" aria-label="Delete"><Trash2 size={16} /></button>
                </td>
              </tr>
            ))}
            {items && items.length === 0 && <tr><td colSpan={5} className="p-8 text-center text-cocoa-muted">No categories.</td></tr>}
            {!items && !error && <tr><td colSpan={5} className="p-8 text-center text-cocoa-muted">Loading...</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}