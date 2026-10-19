"use client";

import { useCallback, useEffect, useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { ApiError } from "@/lib/api";
import { createZone, deleteZone, getZones, updateZone, type AdminZone } from "@/lib/admin-api";
import { formatDA } from "@/lib/format";

const inputCls =
  "h-11 w-full rounded-2xl border-[1.5px] border-line bg-white px-4 text-sm outline-none focus:border-berry focus:ring-[3px] focus:ring-blush";

type Draft = { id?: number; wilaya: string; fee: string; freeAbove: string; isActive: boolean };
const empty: Draft = { wilaya: "", fee: "", freeAbove: "", isActive: true };

export default function DeliveryZonesView() {
  const [items, setItems] = useState<AdminZone[] | null>(null);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      setItems(await getZones());
      setError("");
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Could not load zones");
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  function edit(z: AdminZone) {
    setDraft({ id: z.id, wilaya: z.wilaya, fee: String(z.fee), freeAbove: z.freeAbove != null ? String(z.freeAbove) : "", isActive: z.isActive });
    setError("");
  }

  async function save(ev: React.FormEvent) {
    ev.preventDefault();
    if (!draft) return;
    const fee = Number(draft.fee);
    const freeAbove = draft.freeAbove.trim() === "" ? null : Number(draft.freeAbove);
    if (draft.wilaya.trim().length < 2) return setError("Wilaya name is required.");
    if (!Number.isInteger(fee) || fee < 0) return setError("Fee must be a whole number (0 or more).");
    if (freeAbove !== null && (!Number.isInteger(freeAbove) || freeAbove < 1)) return setError("Free-delivery threshold must be a positive whole number.");

    const body = { wilaya: draft.wilaya.trim(), fee, freeAbove, isActive: draft.isActive };
    setBusy(true);
    try {
      if (draft.id) await updateZone(draft.id, body);
      else await createZone(body);
      setDraft(null);
      setError("");
      await load();
    } catch (e) {
      setError(e instanceof ApiError ? (e.status === 409 ? "This wilaya already exists." : e.message) : "Save failed");
    } finally {
      setBusy(false);
    }
  }

  async function toggle(z: AdminZone) {
    try {
      await updateZone(z.id, { isActive: !z.isActive });
      await load();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Action failed");
    }
  }

  async function remove(z: AdminZone) {
    if (!confirm(`Delete ${z.wilaya}?`)) return;
    try {
      await deleteZone(z.id);
      await load();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Delete failed (deactivate it instead if orders use it).");
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-3xl font-semibold text-cocoa">Delivery zones</h1>
        <button onClick={() => { setDraft(empty); setError(""); }}
          className="flex items-center gap-2 rounded-full bg-berry px-5 py-2.5 text-sm font-semibold text-white hover:bg-berry-dark">
          <Plus size={16} /> New zone
        </button>
      </div>
      <p className="text-sm text-cocoa-muted">Only active zones appear in the checkout wilaya list.</p>

      {error && <p className="rounded-xl bg-danger/10 p-3 text-sm text-danger">{error}</p>}

      {draft && (
        <form onSubmit={save} className="space-y-4 rounded-2xl border border-line bg-white p-5">
          <h2 className="font-display text-xl text-cocoa">{draft.id ? "Edit zone" : "New zone"}</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            <label className="space-y-1.5"><span className="text-xs font-semibold text-cocoa">Wilaya *</span>
              <input className={inputCls} value={draft.wilaya} onChange={(e) => setDraft({ ...draft, wilaya: e.target.value })} placeholder="Biskra" /></label>
            <label className="space-y-1.5"><span className="text-xs font-semibold text-cocoa">Delivery fee (DA) *</span>
              <input className={inputCls} inputMode="numeric" value={draft.fee} onChange={(e) => setDraft({ ...draft, fee: e.target.value })} /></label>
            <label className="space-y-1.5"><span className="text-xs font-semibold text-cocoa">Free above (DA)</span>
              <input className={inputCls} inputMode="numeric" value={draft.freeAbove} onChange={(e) => setDraft({ ...draft, freeAbove: e.target.value })} placeholder="Never free" /></label>
          </div>
          <label className="flex items-center gap-3 text-sm font-semibold text-cocoa">
            <input type="checkbox" className="h-5 w-5 accent-berry" checked={draft.isActive} onChange={(e) => setDraft({ ...draft, isActive: e.target.checked })} />
            Active
          </label>
          <div className="flex gap-3">
            <button disabled={busy} className="h-11 rounded-full bg-berry px-6 text-sm font-semibold text-white hover:bg-berry-dark disabled:opacity-60">Save</button>
            <button type="button" onClick={() => setDraft(null)} className="h-11 rounded-full border border-line bg-white px-6 text-sm font-semibold text-cocoa">Cancel</button>
          </div>
        </form>
      )}

      <div className="overflow-x-auto rounded-2xl border border-line bg-white">
        <table className="w-full min-w-[520px] text-left text-sm">
          <thead className="bg-sand text-xs text-cocoa-muted">
            <tr><th className="p-3">Wilaya</th><th className="p-3">Fee</th><th className="p-3">Free above</th><th className="p-3">Status</th><th className="p-3" /></tr>
          </thead>
          <tbody className="divide-y divide-line">
            {items?.map((z) => (
              <tr key={z.id} className={z.isActive ? "" : "opacity-60"}>
                <td className="p-3 font-semibold text-cocoa">{z.wilaya}</td>
                <td className="p-3">{formatDA(z.fee)}</td>
                <td className="p-3">{z.freeAbove ? formatDA(z.freeAbove) : "—"}</td>
                <td className="p-3">
                  <button onClick={() => toggle(z)}
                    className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${z.isActive ? "bg-success/15 text-success" : "bg-line text-cocoa-soft"}`}>
                    {z.isActive ? "ACTIVE" : "OFF"}
                  </button>
                </td>
                <td className="whitespace-nowrap p-3 text-right">
                  <button onClick={() => edit(z)} className="mr-3 text-berry" aria-label="Edit"><Pencil size={16} /></button>
                  <button onClick={() => remove(z)} className="text-danger" aria-label="Delete"><Trash2 size={16} /></button>
                </td>
              </tr>
            ))}
            {items && items.length === 0 && <tr><td colSpan={5} className="p-8 text-center text-cocoa-muted">No zones yet.</td></tr>}
            {!items && !error && <tr><td colSpan={5} className="p-8 text-center text-cocoa-muted">Loading...</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}