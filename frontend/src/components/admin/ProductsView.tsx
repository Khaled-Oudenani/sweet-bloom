"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { Flower2, Plus, Search } from "lucide-react";
import { ApiError, type Meta } from "@/lib/api";
import { getAdminProducts, updateProduct, type AdminProductListItem } from "@/lib/admin-api";
import { formatDA } from "@/lib/format";

const chip = (active: boolean) =>
  `rounded-full px-4 py-1.5 text-xs font-semibold transition-colors ${
    active ? "bg-berry text-white" : "border border-line bg-white text-cocoa hover:border-berry"
  }`;

export default function ProductsView() {
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);
  const [items, setItems] = useState<AdminProductListItem[] | null>(null);
  const [meta, setMeta] = useState<Meta | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => {
      setQuery(search.trim());
      setPage(1);
    }, 400);
    return () => clearTimeout(t);
  }, [search]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await getAdminProducts({ search: query || undefined, status, page, limit: 15 });
      setItems(r.data);
      setMeta(r.meta);
      setError("");
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Could not load products");
    } finally {
      setLoading(false);
    }
  }, [query, status, page]);

  useEffect(() => {
    load();
  }, [load]);

  async function toggleActive(p: AdminProductListItem) {
    try {
      await updateProduct(p.id, { isActive: !p.isActive });
      await load();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Action failed");
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-3xl font-semibold text-cocoa">Products</h1>
        <Link href="/admin/products/new" className="flex items-center gap-2 rounded-full bg-berry px-5 py-2.5 text-sm font-semibold text-white hover:bg-berry-dark">
          <Plus size={16} /> New product
        </Link>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative w-full max-w-sm">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-cocoa-muted" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search products..."
            className="h-11 w-full rounded-full border-[1.5px] border-line bg-white pl-11 pr-4 text-sm outline-none focus:border-berry focus:ring-[3px] focus:ring-blush" />
        </div>
        <div className="flex gap-2">
          {["all", "active", "inactive"].map((s) => (
            <button key={s} className={chip(status === s)} onClick={() => { setStatus(s); setPage(1); }}>
              {s[0].toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {error && <p className="rounded-xl bg-danger/10 p-4 text-sm text-danger">{error}</p>}

      <div className={`overflow-x-auto rounded-2xl border border-line bg-white ${loading ? "opacity-60" : ""}`}>
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="bg-sand text-xs text-cocoa-muted">
            <tr><th className="p-3">Product</th><th className="p-3">Category</th><th className="p-3">Price</th><th className="p-3">Stock</th><th className="p-3">Status</th><th className="p-3" /></tr>
          </thead>
          <tbody className="divide-y divide-line">
            {items?.map((p) => {
              const stock = p.variants?.reduce((n, v) => n + v.stock, 0);
              return (
                <tr key={p.id} className={p.isActive ? "" : "opacity-60"}>
                  <td className="p-3">
                    <div className="flex items-center gap-3">
                      <div className="relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-sand text-berry/40">
                        {p.imageUrl ? <Image src={p.imageUrl} alt="" fill sizes="48px" className="object-cover" /> : <Flower2 size={20} />}
                      </div>
                      <div className="min-w-0">
                        <Link href={`/admin/products/${p.id}`} className="block truncate font-semibold text-cocoa hover:text-berry">{p.name}</Link>
                        <span className="text-xs text-cocoa-muted">{p.slug}</span>
                      </div>
                    </div>
                  </td>
                  <td className="p-3">{p.category?.name ?? "—"}</td>
                  <td className="p-3 font-semibold text-cocoa">{formatDA(p.basePrice)}</td>
                  <td className={`p-3 font-semibold ${stock === 0 ? "text-danger" : "text-cocoa"}`}>{stock ?? "—"}</td>
                  <td className="p-3">
                    <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${p.isActive ? "bg-success/15 text-success" : "bg-line text-cocoa-soft"}`}>
                      {p.isActive ? "ACTIVE" : "HIDDEN"}
                    </span>
                    {p.isFeatured && <span className="ml-1 rounded-full bg-caramel/25 px-2.5 py-1 text-[11px] font-bold text-cocoa">FEATURED</span>}
                  </td>
                  <td className="whitespace-nowrap p-3 text-right">
                    <Link href={`/admin/products/${p.id}`} className="mr-3 text-xs font-semibold text-berry">Edit</Link>
                    <button onClick={() => toggleActive(p)} className="text-xs font-semibold text-cocoa-soft hover:text-berry">
                      {p.isActive ? "Hide" : "Show"}
                    </button>
                  </td>
                </tr>
              );
            })}
            {items && items.length === 0 && <tr><td colSpan={6} className="p-8 text-center text-cocoa-muted">No products found.</td></tr>}
            {!items && !error && <tr><td colSpan={6} className="p-8 text-center text-cocoa-muted">Loading...</td></tr>}
          </tbody>
        </table>
      </div>

      {meta && meta.totalPages > 1 && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-cocoa-muted">Page {meta.page} of {meta.totalPages} • {meta.total} products</span>
          <div className="flex gap-2">
            <button disabled={page <= 1} onClick={() => setPage(page - 1)} className="rounded-full border border-line bg-white px-4 py-2 font-semibold disabled:opacity-40">Previous</button>
            <button disabled={page >= meta.totalPages} onClick={() => setPage(page + 1)} className="rounded-full border border-line bg-white px-4 py-2 font-semibold disabled:opacity-40">Next</button>
          </div>
        </div>
      )}
    </div>
  );
}