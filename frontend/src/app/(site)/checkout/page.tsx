import { Suspense } from "react";
import { ShieldCheck } from "lucide-react";
import { getDeliveryZones } from "@/lib/api";
import CheckoutForm from "@/components/CheckoutForm";

export const metadata = { title: "Checkout — Sweet Bloom" };

export default function CheckoutPage() {
  return (
    <div className="mx-auto max-w-6xl px-5 pt-8 md:px-12 md:pt-10">
      <p className="text-[11px] font-semibold uppercase tracking-widest text-berry">Artisanal patisserie • Laghouat</p>
      <h1 className="font-display text-[34px] font-semibold text-cocoa md:text-[44px]">Complete Your Order</h1>
      <p className="mb-8 mt-1 flex items-center gap-2 text-sm">
        <ShieldCheck size={16} /> Guest checkout • Settlement via Cash on Delivery
      </p>
      <Suspense fallback={<div className="h-96 animate-pulse rounded-2xl bg-sand" />}>
        <CheckoutContent />
      </Suspense>
    </div>
  );
}

async function CheckoutContent() {
  const zones = await getDeliveryZones().catch(() => []);
  return (
    <>
      {zones.length === 0 && (
        <p className="mb-4 rounded-xl bg-danger/10 p-3 text-sm text-danger">
          Could not load delivery zones. Pickup is still available.
        </p>
      )}
      <CheckoutForm zones={zones} />
    </>
  );
}