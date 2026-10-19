"use client";

import { useCallback, useEffect, useState } from "react";
import { Check, Star, Trash2, X } from "lucide-react";
import { ApiError, type Meta } from "@/lib/api";
import { deleteReview, getAdminReviews, setReviewApproved, type AdminReview } from "@/lib/admin-api";

const TABS = [
  { v: "pending", l: "Pending" },
  { v: "approved", l: "Approved" },
  { v: "all", l: "All" },
];

export default function ReviewsView() {
  const [status, setStatus] = useState("pending");
  const [page, setPage] = useState(1);
  const [items, setItems] = useState<AdminReview[] | null>(null);
  const [meta, setMeta] = useState<Meta | null>(null);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      const r = await getAdminReviews({ status, page, limit: 12 });
      setItems(r.data);
      setMeta(r.meta);
      setError("");
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Could not load reviews");
    }
  }, [status, page]);

  useEffect(() => {
    load();
  }, [load]);

  async function act(fn: () => Promise<unknown>) {
    try {
      await fn();
      await load();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Action failed");
    }
  }

  return (
    <div className="space-y-5">
      <h1 className="font-display text-3xl font-semibold text-cocoa">Reviews</h1>
      <div className="flex gap-2">
        {TABS.map((t) => (
          <button key={t.v} onClick={() => { setStatus(t.v); setPage(1); setItems(null); }}
            className={`rounded-full px-4 py-1.5 text-xs font-semibold ${status === t.v ? "bg-berry text-white" : "border border-line bg-white text-cocoa hover:border-berry"}`}>
            {t.l}
          </button>
        ))}
      </div>

      {error && <p className="rounded-xl bg-danger/10 p-3 text-sm text-danger">{error}</p>}

      <div className="space-y-3">
        {items?.map((r) => (
          <article key={r.id} className="rounded-2xl border border-line bg-white p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="font-semibold text-cocoa">{r.authorName}
                  {r.product?.name && <span className="font-normal text-cocoa-muted"> on {r.product.name}</span>}
                </p>
                <div className="mt-1 flex items-center gap-0.5 text-caramel">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} size={14} fill={i < r.rating ? "currentColor" : "none"} />
                  ))}
                  <span className="ml-2 text-xs text-cocoa-muted">{new Date(r.createdAt).toLocaleDateString("en-GB")}</span>
                </div>
              </div>
              <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${r.isApproved ? "bg-success/15 text-success" : "bg-caramel/25 text-cocoa"}`}>
                {r.isApproved ? "APPROVED" : "PENDING"}
              </span>
            </div>
            {r.comment && <p className="mt-3 break-words text-sm text-cocoa-soft">{r.comment}</p>}
            <div className="mt-3 flex gap-3">
              {!r.isApproved ? (
                <button onClick={() => act(() => setReviewApproved(r.id, true))}
                  className="flex items-center gap-1 rounded-full bg-berry px-4 py-1.5 text-xs font-semibold text-white hover:bg-berry-dark">
                  <Check size={14} /> Approve
                </button>
              ) : (
                <button onClick={() => act(() => setReviewApproved(r.id, false))}
                  className="flex items-center gap-1 rounded-full border border-line px-4 py-1.5 text-xs font-semibold text-cocoa">
                  <X size={14} /> Unapprove
                </button>
              )}
              <button onClick={() => confirm("Delete this review?") && act(() => deleteReview(r.id))}
                className="flex items-center gap-1 text-xs font-semibold text-danger">
                <Trash2 size={14} /> Delete
              </button>
            </div>
          </article>
        ))}
        {items && items.length === 0 && <p className="rounded-2xl bg-sand p-8 text-center text-sm text-cocoa-muted">Nothing here.</p>}
        {!items && !error && <div className="h-32 animate-pulse rounded-2xl bg-sand" />}
      </div>

      {meta && meta.totalPages > 1 && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-cocoa-muted">Page {meta.page} of {meta.totalPages}</span>
          <div className="flex gap-2">
            <button disabled={page <= 1} onClick={() => setPage(page - 1)} className="rounded-full border border-line bg-white px-4 py-2 font-semibold disabled:opacity-40">Previous</button>
            <button disabled={page >= meta.totalPages} onClick={() => setPage(page + 1)} className="rounded-full border border-line bg-white px-4 py-2 font-semibold disabled:opacity-40">Next</button>
          </div>
        </div>
      )}
    </div>
  );
}