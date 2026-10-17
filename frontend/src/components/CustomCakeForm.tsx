"use client";

import { useEffect, useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { ApiError, submitCustomRequest } from "@/lib/api";

const PHONE_RE = /^(?:\+213|0)[567]\d{8}$/;
const OCCASIONS = ["Wedding", "Engagement", "Birthday", "Eid", "Baby shower", "Other"];

const inputCls =
  "w-full rounded-2xl border-[1.5px] border-line bg-white px-4 text-sm outline-none focus:border-berry focus:ring-[3px] focus:ring-blush";

const ymd = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-xs font-semibold text-cocoa">{label}</span>
      {children}
      {error && <span className="block text-xs text-danger">{error}</span>}
    </label>
  );
}

export default function CustomCakeForm() {
  const [form, setForm] = useState({ name: "", phone: "", email: "", eventDate: "", guests: "", description: "" });
  const [occasion, setOccasion] = useState("");
  const [minDate, setMinDate] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<"idle" | "loading" | "ok">("idle");
  const [serverError, setServerError] = useState("");

  useEffect(() => setMinDate(ymd(new Date())), []);

  const set = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }));

  function validate() {
    const e: Record<string, string> = {};
    if (form.name.trim().length < 2) e.name = "Please enter your name";
    if (!PHONE_RE.test(form.phone.replace(/[\s.\-]/g, ""))) e.phone = "Enter a valid Algerian mobile number";
    if (form.email && !/^\S+@\S+\.\S+$/.test(form.email)) e.email = "Invalid email";
    if (form.description.trim().length < 10) e.description = "Please describe your cake (at least 10 characters)";
    return e;
  }

  async function onSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    setServerError("");
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length) return;

    setStatus("loading");
    try {
      const description = occasion ? `Occasion: ${occasion}. ${form.description.trim()}` : form.description.trim();
      await submitCustomRequest({
        name: form.name.trim(),
        phone: form.phone,
        email: form.email.trim() || undefined,
        eventDate: form.eventDate || undefined,
        guests: form.guests ? Number(form.guests) : undefined,
        description,
      });
      setStatus("ok");
    } catch (err) {
      setStatus("idle");
      if (err instanceof ApiError) {
        if (err.errors?.length) {
          const map: Record<string, string> = {};
          err.errors.forEach((x) => {
            const key = String(x.path[0] ?? "");
            if (key && !map[key]) map[key] = x.message;
          });
          setErrors(map);
        }
        setServerError(err.status === 429 ? "Too many requests. Please try again later." : err.message);
      } else {
        setServerError("Could not reach the server. Please try again.");
      }
    }
  }

  if (status === "ok") {
    return (
      <div className="space-y-3 rounded-2xl border border-line bg-white p-8 text-center">
        <CheckCircle2 size={48} className="mx-auto text-success" />
        <h2 className="font-display text-2xl text-cocoa">Request received!</h2>
        <p className="text-sm">Our pastry chef will contact you within 24 hours to discuss flavors, design and pricing.</p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-5 rounded-2xl border border-line bg-white p-5 shadow-warm md:p-7">
      <div className="space-y-2">
        <p className="text-xs font-semibold text-cocoa">Occasion</p>
        <div className="flex flex-wrap gap-2">
          {OCCASIONS.map((o) => (
            <button
              type="button"
              key={o}
              onClick={() => setOccasion(occasion === o ? "" : o)}
              className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-colors ${
                occasion === o ? "bg-berry text-white" : "bg-sand text-cocoa hover:bg-blush"
              }`}
            >
              {o}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Full name *" error={errors.name}>
          <input className={`${inputCls} h-11`} value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="Your name" autoComplete="name" />
        </Field>
        <Field label="Phone / WhatsApp *" error={errors.phone}>
          <input className={`${inputCls} h-11`} value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder="0661 48 92 10" inputMode="tel" autoComplete="tel" />
        </Field>
        <Field label="Email (optional)" error={errors.email}>
          <input className={`${inputCls} h-11`} type="email" value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="you@example.com" />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Event date" error={errors.eventDate}>
            <input className={`${inputCls} h-11`} type="date" min={minDate} value={form.eventDate} onChange={(e) => set("eventDate", e.target.value)} />
          </Field>
          <Field label="Guests" error={errors.guests}>
            <input className={`${inputCls} h-11`} type="number" min={1} value={form.guests} onChange={(e) => set("guests", e.target.value)} placeholder="80" />
          </Field>
        </div>
      </div>

      <Field label="Describe your dream cake *" error={errors.description}>
        <textarea
          className={`${inputCls} py-3`}
          rows={5}
          maxLength={1500}
          value={form.description}
          onChange={(e) => set("description", e.target.value)}
          placeholder="Tiers, flavors, colors, decorations, dietary needs, inspiration..."
        />
        <span className="block text-right text-[11px] text-cocoa-muted">{form.description.length}/1500</span>
      </Field>

      {serverError && <p className="rounded-xl bg-danger/10 p-3 text-sm text-danger">{serverError}</p>}

      <button
        disabled={status === "loading"}
        className="h-12 w-full rounded-full bg-berry text-sm font-semibold text-white transition-colors hover:bg-berry-dark disabled:opacity-60"
      >
        {status === "loading" ? "Sending..." : "Send my request"}
      </button>
      <p className="text-center text-xs text-cocoa-muted">No payment now. We will call you to confirm the details and price.</p>
    </form>
  );
}