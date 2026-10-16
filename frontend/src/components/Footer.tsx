import Link from "next/link";
import { Flower2, Truck } from "lucide-react";
import NewsletterForm from "./NewsletterForm";

export default function Footer() {
  return (
    <footer className="mt-20 border-t border-line bg-sand">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-12 md:grid-cols-3 md:px-12">
        <div className="space-y-4">
          <Link href="/" className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-blush text-berry">
              <Flower2 size={18} />
            </span>
            <span className="font-display text-xl font-semibold text-cocoa">Sweet Bloom</span>
          </Link>
          <p className="text-sm leading-6">
            Artisan pâtisserie &amp; confectionery in Laghouat, Algeria. Handcrafted
            celebration cakes, ethereal macarons and slow-laminated viennoiseries.
          </p>
          <span className="inline-flex items-center gap-2 rounded-full bg-pistachio px-3 py-1.5 text-xs font-semibold text-pistachio-ink">
            <Truck size={14} /> Cash on Delivery in Laghouat &amp; Region
          </span>
        </div>

        <div className="space-y-3 text-sm">
          <h3 className="font-display text-lg text-cocoa">Atelier &amp; Hours</h3>
          <p><b className="text-cocoa">Address:</b> Cité El Wafaa, Laghouat, Algeria</p>
          <p><b className="text-cocoa">Hours:</b> Mon – Sat: 09:00 – 20:00</p>
          <p><b className="text-cocoa">Friday:</b> 14:00 – 20:00</p>
          <p>
            <b className="text-cocoa">Phone &amp; WhatsApp:</b>{" "}
            <a href="tel:+213541929912" className="text-berry">+213 541 92 99 12</a>
          </p>
        </div>

        <div className="space-y-3">
          <h3 className="font-display text-lg text-cocoa">The Weekly Oven Preview</h3>
          <p className="text-sm">
            Receive weekly fresh bake schedules and seasonal dessert releases in your inbox.
          </p>
          <NewsletterForm />
        </div>
      </div>

      <div className="border-t border-line">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-5 py-5 text-xs text-cocoa-muted md:flex-row md:justify-between md:px-12">
          <p>© {new Date().getFullYear()} Sweet Bloom Confectionery. Guest checkout only.</p>
          <p>Pure Butter &amp; Artisanal Vanilla • Laghouat, Algeria</p>
        </div>
      </div>
    </footer>
  );
}