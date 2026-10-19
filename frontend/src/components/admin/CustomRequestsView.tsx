"use client";

import { useCallback, useEffect, useState } from "react";
import { MessageCircle, Phone } from "lucide-react";
import { ApiError, type Meta } from "@/lib/api";
import { getCustomRequests, setRequestStatus, type AdminCustomRequest, type RequestStatus } from "@/lib/admin-api";

const TABS = ["", "NEW", "CONTACTED", "DONE"];
const COLORS: Record<RequestStatus, string> = {
  NEW: "bg-caramel/25 text-cocoa",
  CONTACTED: "bg-blush text-berry",
  DONE: "bg-success/15 text-success",
};

function waLink(phone: string) {
  let n = phone.replace(/\D/g, "");
  if (n.startsWith("0")) n = "213" + n.slice(1); // الأرقام الجزائرية المحلية
  return `https://wa.me/${n}`;
}

export default function CustomRequestsView() {
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [items, setItems] = useState<AdminCustomRequest[] | null>(null);
  const [meta, setMeta] = useState<Meta | null>(null);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      const r = await getCustomRequests({ status: status || undefined, page, limit: 10 });
      setItems(r.data);
      setMeta(r.meta);
      setError("");
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Could not load requests");
    }
  }, [status, page]);

  useEffect(() => {
    load();
  }, [load]);

  async function change(id: number, s: RequestStatus) {
    try {
      await setRequestStatus(id, s);
      await load();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Action failed");
    }
  }

  return (
    <div className="space-y-5">
      <h1 className="font-display text-3xl font-semibold text-cocoa">Custom cake requests</h1>
      <div className="flex flex-wrap gap-2">
        {TABS.map((t) => (
          <button key={t || "all"} onClick={() => { setStatus(t); setPage(1); setItems(null); }}
            className={`rounded-full px-4 py-1.5 text-xs font-semibold ${status === t ? "bg-berry text-white" : "border border-line bg-white text-cocoa hover:border-berry"}`}>
            {t ? t[0] + t.slice(1).toLowerCase() : "All"}
          </button>
        ))}
      </div>

      {error && <p className="rounded-xl bg-danger/10 p-3 text-sm text-danger">{error}</p>}

      <div className="space-y-3">
        {items?.map((r) => (
          <article key={r.id} className="rounded-2xl border border-line bg-white p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-semibold text-cocoa">{r.name}</p>
                <p className="text-xs text-cocoa-muted">
                  {new Date(r.createdAt).toLocaleDateString("en-GB")}
                  {r.eventDate && ` • Event: ${new Date(r.eventDate).toLocaleDateString("en-GB")}`}
                  {r.guests ? ` • ${r.guests} guests` : ""}
                </p>
              </div>
              <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${COLORS[r.status]}`}>{r.status}</span>
            </div>
            <p className="mt-3 whitespace-pre-wrap break-words text-sm text-cocoa-soft">{r.description}</p>
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <a href={`tel:${r.phone}`} className="flex items-center gap-1 text-xs font-semibold text-berry"><Phone size={14} /> {r.phone}</a>
              <a href={waLink(r.phone)} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-xs font-semibold text-berry"><MessageCircle size={14} /> WhatsApp</a>
              {r.email && <a href={`mailto:${r.email}`} className="text-xs font-semibold text-berry">{r.email}</a>}
              <select value={r.status} onChange={(e) => change(r.id, e.target.value as RequestStatus)}
                className="ml-auto h-9 rounded-full border border-line bg-white px-3 text-xs font-semibold text-cocoa">
                <option value="NEW">New</option>
                <option value="CONTACTED">Contacted</option>
                <option value="DONE">Done</option>
              </select>
            </div>
          </article>
        ))}
        {items && items.length === 0 && <p className="rounded-2xl bg-sand p-8 text-center text-sm text-cocoa-muted">No requests.</p>}
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