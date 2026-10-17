"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Banknote, Gift, Lock, Store, Tag, Truck } from "lucide-react";
import {
  ApiError,
  createOrder,
  quoteOrder,
  type DeliveryType,
  type DeliveryZone,
  type Quote,
  type TimeWindow,
} from "@/lib/api";
import { formatDA } from "@/lib/format";
import { useCart } from "@/store/cart";

const TIME_WINDOWS: { value: TimeWindow; label: string; hours: string }[] = [
  { value: "MORNING", label: "Morning", hours: "09:00 – 12:00" },
  { value: "AFTERNOON", label: "Afternoon", hours: "14:00 – 17:00" },
  { value: "EVENING", label: "Evening", hours: "18:00 – 21:00" },
];

const PHONE_RE = /^(?:\+213|0)[567]\d{8}$/;
const inputCls =
  "h-11 w-full rounded-2xl border-[1.5px] border-line bg-white px-4 text-sm outline-none focus:border-berry focus:ring-[3px] focus:ring-blush";

const ymd = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

function Section({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-4 rounded-2xl border border-line bg-white p-5 md:p-6">
      <h2 className="flex items-center gap-3 font-display text-xl text-cocoa">
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-blush text-sm font-bold text-berry">
          {n}
        </span>
        {title}
      </h2>
      {children}
    </section>
  );
}

function Field({ label, error, hint, children }: { label: string; error?: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-xs font-semibold text-cocoa">{label}</span>
      {children}
      {hint && !error && <span className="block text-xs text-cocoa-muted">{hint}</span>}
      {error && <span className="block text-xs text-danger">{error}</span>}
    </label>
  );
}

const chip = (active: boolean) =>
  `rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
    active ? "bg-berry text-white" : "bg-sand text-cocoa hover:bg-blush"
  }`;

export default function CheckoutForm({ zones }: { zones: DeliveryZone[] }) {
  const router = useRouter();
  const items = useCart((s) => s.items);
  const clear = useCart((s) => s.clear);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const [deliveryType, setDeliveryType] = useState<DeliveryType>("DELIVERY");
  const [form, setForm] = useState({
    customerName: "",
    phone: "",
    email: "",
    wilaya: zones.find((z) => z.wilaya === "Laghouat")?.wilaya ?? "",
    address: "",
    notes: "",
    giftMessage: "",
  });
  const [isGift, setIsGift] = useState(false);
  const [dateChoice, setDateChoice] = useState<"today" | "tomorrow" | "custom">("tomorrow");
  const [customDate, setCustomDate] = useState("");
  const [timeWindow, setTimeWindow] = useState<TimeWindow>("AFTERNOON");

  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState("");
  const [couponError, setCouponError] = useState("");

  const [quote, setQuote] = useState<Quote | null>(null);
  const [quoteError, setQuoteError] = useState("");

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const set = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }));

  /* ---------- quote (كل تغيير يعيد الحساب من السيرفر) ---------- */
  const reqId = useRef(0);
  useEffect(() => {
    if (!mounted || items.length === 0) return;
    const id = ++reqId.current;
    const t = setTimeout(async () => {
      try {
        const q = await quoteOrder({
          items: items.map((i) => ({
            variantId: i.variantId,
            quantity: i.quantity,
            inscription: i.inscription,
          })),
          deliveryType,
          wilaya: deliveryType === "DELIVERY" ? form.wilaya || undefined : undefined,
          couponCode: appliedCoupon || undefined,
        });
        if (id !== reqId.current) return;
        setQuote(q);
        setQuoteError("");
      } catch (e) {
        if (id !== reqId.current) return;
        const msg = e instanceof ApiError ? e.message : "Could not calculate totals";
        if (appliedCoupon) {
          setCouponError(msg);
          setAppliedCoupon("");
        } else {
          setQuote(null);
          setQuoteError(msg);
        }
      }
    }, 250);
    return () => clearTimeout(t);
  }, [mounted, items, deliveryType, form.wilaya, appliedCoupon]);

  if (!mounted) return <div className="h-96 animate-pulse rounded-2xl bg-sand" />;
  if (done) return <p className="py-20 text-center text-sm">Placing your order...</p>;

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-2xl border border-line bg-white p-12 text-center">
        <p className="font-display text-xl text-cocoa">Your basket is empty</p>
        <Link href="/shop" className="rounded-full bg-berry px-6 py-3 text-sm font-semibold text-white hover:bg-berry-dark">
          Browse the shop
        </Link>
      </div>
    );
  }

  const today = ymd(new Date());
  const tomorrow = ymd(new Date(Date.now() + 86_400_000));
  const deliveryDate = dateChoice === "today" ? today : dateChoice === "tomorrow" ? tomorrow : customDate;

  const zone = zones.find((z) => z.wilaya === form.wilaya);
  const net = quote ? quote.subtotal - quote.discount : 0;
  const showFreeBar = deliveryType === "DELIVERY" && !!zone?.freeAbove && !!quote;
  const freeRemaining = zone?.freeAbove ? zone.freeAbove - net : 0;
  const freePct = zone?.freeAbove ? Math.min(100, Math.round((net / zone.freeAbove) * 100)) : 0;

  function applyCoupon() {
    const code = couponInput.trim().toUpperCase();
    if (!code) return;
    setCouponError("");
    setAppliedCoupon(code);
  }

  function validate() {
    const e: Record<string, string> = {};
    if (form.customerName.trim().length < 2) e.customerName = "Please enter your full name";
    if (!PHONE_RE.test(form.phone.replace(/[\s.\-]/g, ""))) e.phone = "Enter a valid Algerian mobile number (05, 06 or 07...)";
    if (form.email && !/^\S+@\S+\.\S+$/.test(form.email)) e.email = "Invalid email";
    if (deliveryType === "DELIVERY") {
      if (!form.wilaya) e.wilaya = "Select your wilaya";
      if (form.address.trim().length < 5) e.address = "Please enter a complete address";
    }
    if (dateChoice === "custom" && (!customDate || customDate < today)) e.deliveryDate = "Choose a valid date";
    return e;
  }

  async function onSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    setSubmitError("");
    const errs = validate();
    setFieldErrors(errs);
    if (Object.keys(errs).length) {
      setSubmitError("Please check the highlighted fields.");
      return;
    }
    setSubmitting(true);
    try {
      const order = await createOrder({
        customerName: form.customerName.trim(),
        phone: form.phone,
        email: form.email.trim() || undefined,
        deliveryType,
        wilaya: deliveryType === "DELIVERY" ? form.wilaya : undefined,
        address: deliveryType === "DELIVERY" ? form.address.trim() : undefined,
        notes: form.notes.trim() || undefined,
        deliveryDate: deliveryDate || undefined,
        timeWindow,
        isGift,
        giftMessage: isGift && form.giftMessage.trim() ? form.giftMessage.trim() : undefined,
        couponCode: appliedCoupon || undefined,
        items: items.map((i) => ({
          variantId: i.variantId,
          quantity: i.quantity,
          inscription: i.inscription,
        })),
      });
      sessionStorage.setItem("sb-last-order", JSON.stringify(order));
      setDone(true);
      router.push("/order-confirmed");
      clear();
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.errors?.length) {
          const map: Record<string, string> = {};
          err.errors.forEach((x) => {
            const key = String(x.path[0] ?? "");
            if (key && !map[key]) map[key] = x.message;
          });
          setFieldErrors(map);
        }
        setSubmitError(err.status === 429 ? "Too many attempts. Please try again later." : err.message);
      } else {
        setSubmitError("Could not reach the server. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={onSubmit} noValidate className="grid gap-6 lg:grid-cols-[1fr_380px]">
      {/* ---------------- left ---------------- */}
      <div className="min-w-0 space-y-6">
        <Section n={1} title="Fulfillment Method">
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              { type: "DELIVERY" as const, icon: Truck, title: "Delivery", text: "Direct to your doorstep in Laghouat and neighboring wilayas.", tag: zone ? (zone.fee === 0 ? "FREE" : `+${formatDA(zone.fee)}`) : "Fee by wilaya" },
              { type: "PICKUP" as const, icon: Store, title: "Atelier Pickup", text: "Cité El Wafaa, Laghouat. Ready within 2 hrs of baking.", tag: "FREE" },
            ].map(({ type, icon: Icon, title, text, tag }) => {
              const active = deliveryType === type;
              return (
                <button
                  type="button"
                  key={type}
                  onClick={() => setDeliveryType(type)}
                  className={`space-y-2 rounded-2xl border-[1.5px] p-4 text-left transition-colors ${
                    active ? "border-berry bg-berry text-white" : "border-line bg-blush/40 text-cocoa hover:border-berry"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <Icon size={22} />
                    <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${active ? "bg-white/20" : "bg-white text-berry"}`}>
                      {tag}
                    </span>
                  </div>
                  <p className="font-display text-lg">{title}</p>
                  <p className={`text-xs leading-5 ${active ? "text-white/85" : "text-cocoa-soft"}`}>{text}</p>
                </button>
              );
            })}
          </div>
        </Section>

        <Section n={2} title={deliveryType === "DELIVERY" ? "Recipient & Destination" : "Your Details"}>
          <p className="text-xs text-cocoa-muted">We will call or WhatsApp this number to confirm timing. No password required.</p>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Full name *" error={fieldErrors.customerName}>
              <input className={inputCls} value={form.customerName} onChange={(e) => set("customerName", e.target.value)} placeholder="Amina Benali" autoComplete="name" />
            </Field>
            <Field label="Phone number *" error={fieldErrors.phone} hint="Mobilis, Djezzy or Ooredoo">
              <input className={inputCls} value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder="0661 48 92 10" inputMode="tel" autoComplete="tel" />
            </Field>
          </div>
          <Field label="Email (optional)" error={fieldErrors.email}>
            <input className={inputCls} type="email" value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="you@example.com" autoComplete="email" />
          </Field>

          {deliveryType === "DELIVERY" && (
            <>
              <Field label="Wilaya *" error={fieldErrors.wilaya}>
                <select className={inputCls} value={form.wilaya} onChange={(e) => set("wilaya", e.target.value)}>
                  <option value="">Select a wilaya</option>
                  {zones.map((z) => (
                    <option key={z.wilaya} value={z.wilaya}>{z.wilaya}</option>
                  ))}
                </select>
              </Field>
              <Field label="Street, district & landmark *" error={fieldErrors.address}>
                <textarea
                  className="w-full rounded-2xl border-[1.5px] border-line bg-white px-4 py-3 text-sm outline-none focus:border-berry focus:ring-[3px] focus:ring-blush"
                  rows={3}
                  value={form.address}
                  onChange={(e) => set("address", e.target.value)}
                  placeholder="Cité El Wafaa, Rue des Palmiers, Villa 28 (near the pharmacy)"
                />
              </Field>
            </>
          )}
        </Section>

        <Section n={3} title="Delivery Schedule">
          <div className="space-y-2">
            <p className="text-xs font-semibold text-cocoa">Preferred date</p>
            <div className="flex flex-wrap gap-2">
              <button type="button" className={chip(dateChoice === "today")} onClick={() => setDateChoice("today")}>Today</button>
              <button type="button" className={chip(dateChoice === "tomorrow")} onClick={() => setDateChoice("tomorrow")}>Tomorrow</button>
              <button type="button" className={chip(dateChoice === "custom")} onClick={() => setDateChoice("custom")}>Select date...</button>
            </div>
            {dateChoice === "custom" && (
              <input type="date" min={today} value={customDate} onChange={(e) => setCustomDate(e.target.value)} className={`${inputCls} max-w-xs`} />
            )}
            {fieldErrors.deliveryDate && <p className="text-xs text-danger">{fieldErrors.deliveryDate}</p>}
          </div>
          <div className="space-y-2">
            <p className="text-xs font-semibold text-cocoa">Preferred time window</p>
            <div className="grid gap-3 sm:grid-cols-3">
              {TIME_WINDOWS.map((w) => (
                <button
                  type="button"
                  key={w.value}
                  onClick={() => setTimeWindow(w.value)}
                  className={`rounded-2xl p-3 text-left transition-colors ${
                    timeWindow === w.value ? "bg-berry text-white" : "bg-blush/40 text-cocoa hover:bg-blush"
                  }`}
                >
                  <span className="block text-xs">{w.label}</span>
                  <span className="block font-bold">{w.hours}</span>
                </button>
              ))}
            </div>
          </div>
        </Section>

        <Section n={4} title="Gift Options & Special Requests">
          <label className="flex cursor-pointer items-start gap-3 rounded-2xl bg-blush/40 p-4">
            <Gift size={22} className="mt-0.5 shrink-0 text-caramel" />
            <span className="flex-1">
              <span className="block font-display text-lg text-cocoa">This order is a surprise gift</span>
              <span className="text-xs text-cocoa-soft">Add a handwritten greeting card note.</span>
            </span>
            <input type="checkbox" checked={isGift} onChange={(e) => setIsGift(e.target.checked)} className="mt-1 h-5 w-5 accent-berry" />
          </label>
          {isGift && (
            <Field label="Greeting card note" error={fieldErrors.giftMessage} hint={`${form.giftMessage.length}/250`}>
              <textarea
                className="w-full rounded-2xl border-[1.5px] border-line bg-white px-4 py-3 text-sm outline-none focus:border-berry focus:ring-[3px] focus:ring-blush"
                rows={3}
                maxLength={250}
                value={form.giftMessage}
                onChange={(e) => set("giftMessage", e.target.value)}
                placeholder="Joyeux anniversaire, mabrouk!"
              />
            </Field>
          )}
          <Field label="Notes for the pastry chef & courier (optional)" error={fieldErrors.notes}>
            <textarea
              className="w-full rounded-2xl border-[1.5px] border-line bg-white px-4 py-3 text-sm outline-none focus:border-berry focus:ring-[3px] focus:ring-blush"
              rows={2}
              maxLength={500}
              value={form.notes}
              onChange={(e) => set("notes", e.target.value)}
              placeholder="Please keep the box horizontal. Call before arriving."
            />
          </Field>
        </Section>
      </div>

      {/* ---------------- right: summary ---------------- */}
      <aside className="min-w-0 space-y-4 lg:sticky lg:top-24 lg:self-start">
        <div className="space-y-4 rounded-2xl border border-line bg-white p-5">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-xl text-cocoa">Order Summary</h2>
            <button type="button" onClick={() => useCart.getState().openCart()} className="text-xs font-semibold text-berry">
              Edit cart
            </button>
          </div>

          <ul className="space-y-3">
            {items.map((it) => {
              const unit = quote?.items.find((q) => q.variantId === it.variantId)?.unitPrice ?? it.price;
              return (
                <li key={`${it.variantId}|${it.inscription ?? ""}`} className="flex gap-3">
                  <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-sand">
                    {it.image && <Image src={it.image} alt={it.name} fill sizes="56px" className="object-cover" />}
                    <span className="absolute bottom-0 left-0 rounded-tr-lg bg-berry px-1.5 text-[10px] font-bold text-white">{it.quantity}x</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-cocoa">{it.name}</p>
                    <p className="text-xs text-cocoa-muted">{it.variantLabel}</p>
                    {it.inscription && <p className="truncate text-[11px] italic text-berry">Plaque: “{it.inscription}”</p>}
                  </div>
                  <p className="text-sm font-bold text-cocoa">{formatDA(unit * it.quantity)}</p>
                </li>
              );
            })}
          </ul>

          {/* coupon */}
          <div className="space-y-1.5">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Tag size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-cocoa-muted" />
                <input
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); applyCoupon(); } }}
                  placeholder="Promo code"
                  className="h-11 w-full rounded-full bg-blush/40 pl-9 pr-3 text-sm uppercase outline-none focus:ring-[3px] focus:ring-blush"
                />
              </div>
              <button type="button" onClick={applyCoupon} className="rounded-full bg-blush px-5 text-sm font-semibold text-berry hover:bg-blush-dark">
                Apply
              </button>
            </div>
            {couponError && <p className="text-xs text-danger">{couponError}</p>}
            {appliedCoupon && quote?.couponCode && <p className="text-xs text-success">Promo code {quote.couponCode} applied.</p>}
          </div>

          {showFreeBar && (
            <div className="space-y-1.5 rounded-xl bg-blush/40 p-3">
              <div className="flex justify-between text-xs font-semibold text-cocoa">
                <span>Free delivery</span><span>{freePct}%</span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-white">
                <div className="h-full rounded-full bg-berry transition-all" style={{ width: `${freePct}%` }} />
              </div>
              <p className="text-xs text-cocoa-soft">
                {freeRemaining > 0 ? `Add ${formatDA(freeRemaining)} more to unlock free delivery!` : "Free delivery unlocked!"}
              </p>
            </div>
          )}

          {quoteError && <p className="rounded-xl bg-danger/10 p-3 text-xs text-danger">{quoteError}</p>}

          {quote && (
            <dl className="space-y-2 border-t border-line pt-4 text-sm">
              <div className="flex justify-between"><dt>Subtotal</dt><dd className="font-semibold text-cocoa">{formatDA(quote.subtotal)}</dd></div>
              {quote.discount > 0 && (
                <div className="flex justify-between text-success"><dt>Discount</dt><dd className="font-semibold">-{formatDA(quote.discount)}</dd></div>
              )}
              <div className="flex justify-between">
                <dt>{deliveryType === "PICKUP" ? "Pickup" : "Delivery"}</dt>
                <dd className="font-semibold text-cocoa">
                  {deliveryType === "DELIVERY" && !form.wilaya ? "Select wilaya" : quote.deliveryFee === 0 ? "Free" : formatDA(quote.deliveryFee)}
                </dd>
              </div>
              <div className="-mx-5 -mb-5 flex items-end justify-between rounded-b-2xl bg-blush/50 px-5 py-4">
                <span className="text-[11px] font-bold uppercase tracking-widest text-cocoa-soft">Grand total<br />Pay on arrival</span>
                <span className="font-display text-3xl font-semibold text-berry">{formatDA(quote.total)}</span>
              </div>
            </dl>
          )}
        </div>

        <div className="flex gap-3 rounded-2xl border border-line bg-white p-4">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-caramel/30 text-caramel"><Banknote size={20} /></span>
          <div>
            <p className="font-display text-lg text-cocoa">Cash on Delivery</p>
            <p className="text-xs leading-5">Pay in cash to our courier upon delivery. You can inspect the box before paying. No card needed.</p>
          </div>
        </div>

        {submitError && <p className="rounded-xl bg-danger/10 p-3 text-sm text-danger">{submitError}</p>}

        <button
          disabled={submitting || !quote}
          className="flex h-13 w-full items-center justify-center gap-2 rounded-full bg-berry py-3.5 text-sm font-semibold text-white shadow-warm transition-colors hover:bg-berry-dark disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Lock size={16} />
          {submitting ? "Placing order..." : quote ? `Confirm Order — ${formatDA(quote.total)}` : "Calculating..."}
        </button>
        <p className="text-center text-xs text-cocoa-muted">
          By confirming, our team will call or message you on WhatsApp to confirm your order.
        </p>
      </aside>
    </form>
  );
}