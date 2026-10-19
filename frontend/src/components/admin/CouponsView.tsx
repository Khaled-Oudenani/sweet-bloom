"use client";

import { useCallback, useEffect, useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { ApiError } from "@/lib/api";
import { createCoupon, deleteCoupon, getCoupons, updateCoupon, type AdminCoupon } from "@/lib/admin-api";
import { formatDA } from "@/lib/format";

const inputCls =
  "h-11 w-full rounded-2xl border-[1.5px] border-line bg-white px-4 text-sm outline-none focus:border-berry focus:ring-[3px] focus:ring-blush";

type Draft = {
  id?: number; code: string; type: "PERCENT" | "FIXED"; value: string;
  minOrder: string; maxUses: string; expiresAt: string; isActive: boolean;
};
const empty: Draft = { code: "", type: "PERCENT", value: "", minOrder: "", maxUses: "", expiresAt: "", isActive: true };

const optInt = (s: string) => (s.trim() === "" ? null : Number(s));

export default function CouponsView() {
  const [items, setItems] = useState<AdminCoupon[] | null>(null);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      setItems(await getCoupons());
      setError("");
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Could not load coupons");
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  function edit(c: AdminCoupon) {
    setDraft({
      id: c.id, code: c.code, type: c.type, value: String(c.value),
      minOrder: c.minOrder != null ? String(c.minOrder) : "",
      maxUses: c.maxUses != null ? String(c.maxUses) : "",
      expiresAt: c.expiresAt ? c.expiresAt.slice(0, 10) : "",
      isActive: c.isActive,
    });
    setError("");
  }

  async function save(ev: React.FormEvent) {
    ev.preventDefault();
    if (!draft) return;
    const code = draft.code.trim().toUpperCase();
    const value = Number(draft.value);
    const minOrder = optInt(draft.minOrder);
    const maxUses = optInt(draft.maxUses);

    if (!/^[A-Z0-9_-]{3,20}$/.test(code)) return setError("Code: 3-20 characters (A-Z, 0-9, - or _).");
    if (!Number.isInteger(value) || value < 1) return setError("Value must be a positive whole number.");
    if (draft.type === "PERCENT" && value > 100) return setError("A percent coupon cannot exceed 100.");
    if ((minOrder !== null && (!Number.isInteger(minOrder) || minOrder < 0)) ||
        (maxUses !== null && (!Number.isInteger(maxUses) || maxUses < 1)))
      return setError("Minimum order and max uses must be whole numbers.");

    const body = { code, type: draft.type, value, minOrder, maxUses, expiresAt: draft.expiresAt || null, isActive: draft.isActive };
    setBusy(true);
    try {
      if (draft.id) await updateCoupon(draft.id, body);
      else await createCoupon(body);
      setDraft(null);
      setError("");
      await load();
    } catch (e) {
      setError(e instanceof ApiError ? (e.status === 409 ? "This code already exists." : e.message) : "Save failed");
    } finally {
      setBusy(false);
    }
  }

  async function toggle(c: AdminCoupon) {
    try {
      await updateCoupon(c.id, { isActive: !c.isActive });
      await load();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Action failed");
    }
  }

  async function remove(c: AdminCoupon) {
    if (!confirm(`Delete coupon ${c.code}?`)) return;
    try {
      await deleteCoupon(c.id);
      await load();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Delete failed (it may already be used by orders; deactivate it instead).");
    }
  }

  const expired = (c: AdminCoupon) => !!c.expiresAt && new Date(c.expiresAt).getTime() < Date.now();

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-3xl font-semibold text-cocoa">Coupons</h1>
        <button onClick={() => { setDraft(empty); setError(""); }}
          className="flex items-center gap-2 rounded-full bg-berry px-5 py-2.5 text-sm font-semibold text-white hover:bg-berry-dark">
          <Plus size={16} /> New coupon
        </button>
      </div>

      {error && <p className="rounded-xl bg-danger/10 p-3 text-sm text-danger">{error}</p>}

      {draft && (
        <form onSubmit={save} className="space-y-4 rounded-2xl border border-line bg-white p-5">
          <h2 className="font-display text-xl text-cocoa">{draft.id ? "Edit coupon" : "New coupon"}</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <label className="space-y-1.5"><span className="text-xs font-semibold text-cocoa">Code *</span>
              <input className={`${inputCls} uppercase`} value={draft.code} onChange={(e) => setDraft({ ...draft, code: e.target.value })} placeholder="EID25" /></label>
            <label className="space-y-1.5"><span className="text-xs font-semibold text-cocoa">Type *</span>
              <select className={inputCls} value={draft.type} onChange={(e) => setDraft({ ...draft, type: e.target.value as Draft["type"] })}>
                <option value="PERCENT">Percent (%)</option>
                <option value="FIXED">Fixed amount (DA)</option>
              </select></label>
            <label className="space-y-1.5"><span className="text-xs font-semibold text-cocoa">Value * {draft.type === "PERCENT" ? "(1-100)" : "(DA)"}</span>
              <input className={inputCls} inputMode="numeric" value={draft.value} onChange={(e) => setDraft({ ...draft, value: e.target.value })} /></label>
            <label className="space-y-1.5"><span className="text-xs font-semibold text-cocoa">Minimum order (DA)</span>
              <input className={inputCls} inputMode="numeric" value={draft.minOrder} onChange={(e) => setDraft({ ...draft, minOrder: e.target.value })} placeholder="Optional" /></label>
            <label className="space-y-1.5"><span className="text-xs font-semibold text-cocoa">Max uses</span>
              <input className={inputCls} inputMode="numeric" value={draft.maxUses} onChange={(e) => setDraft({ ...draft, maxUses: e.target.value })} placeholder="Unlimited" /></label>
            <label className="space-y-1.5"><span className="text-xs font-semibold text-cocoa">Expires on</span>
              <input type="date" className={inputCls} value={draft.expiresAt} onChange={(e) => setDraft({ ...draft, expiresAt: e.target.value })} /></label>
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
        <table className="w-full min-w-[680px] text-left text-sm">
          <thead className="bg-sand text-xs text-cocoa-muted">
            <tr><th className="p-3">Code</th><th className="p-3">Discount</th><th className="p-3">Min order</th><th className="p-3">Used</th><th className="p-3">Expires</th><th className="p-3">Status</th><th className="p-3" /></tr>
          </thead>
          <tbody className="divide-y divide-line">
            {items?.map((c) => (
              <tr key={c.id} className={c.isActive && !expired(c) ? "" : "opacity-60"}>
                <td className="p-3 font-mono font-bold text-cocoa">{c.code}</td>
                <td className="p-3 font-semibold">{c.type === "PERCENT" ? `${c.value}%` : formatDA(c.value)}</td>
                <td className="p-3">{c.minOrder ? formatDA(c.minOrder) : "—"}</td>
                <td className="p-3">{c.usedCount ?? 0}{c.maxUses ? ` / ${c.maxUses}` : ""}</td>
                <td className="p-3">{c.expiresAt ? new Date(c.expiresAt).toLocaleDateString("en-GB") : "—"}</td>
                <td className="p-3">
                  <button onClick={() => toggle(c)}
                    className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${expired(c) ? "bg-danger/10 text-danger" : c.isActive ? "bg-success/15 text-success" : "bg-line text-cocoa-soft"}`}>
                    {expired(c) ? "EXPIRED" : c.isActive ? "ACTIVE" : "OFF"}
                  </button>
                </td>
                <td className="whitespace-nowrap p-3 text-right">
                  <button onClick={() => edit(c)} className="mr-3 text-berry" aria-label="Edit"><Pencil size={16} /></button>
                  <button onClick={() => remove(c)} className="text-danger" aria-label="Delete"><Trash2 size={16} /></button>
                </td>
              </tr>
            ))}
            {items && items.length === 0 && <tr><td colSpan={7} className="p-8 text-center text-cocoa-muted">No coupons yet.</td></tr>}
            {!items && !error && <tr><td colSpan={7} className="p-8 text-center text-cocoa-muted">Loading...</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}