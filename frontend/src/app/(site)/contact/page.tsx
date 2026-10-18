import { Clock, MapPin, MessageCircle, Phone } from "lucide-react";
import Link from "next/link";
import { SITE } from "@/lib/site";

export const metadata = { title: "Contact — Sweet Bloom" };

const card = "space-y-2 rounded-2xl border border-line bg-white p-6";
const iconBox = "flex h-11 w-11 items-center justify-center rounded-xl bg-blush text-berry";

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-8 px-5 pt-8 md:px-12 md:pt-12">
      <header>
        <p className="text-[11px] font-semibold uppercase tracking-widest text-berry">We would love to hear from you</p>
        <h1 className="font-display text-[34px] font-semibold text-cocoa md:text-[44px]">Contact the Atelier</h1>
        <p className="mt-2 max-w-xl text-sm">Questions about an order, a flavor or a celebration? Reach us the way you prefer.</p>
      </header>

      <div className="grid gap-5 sm:grid-cols-2">
        <a href={`https://wa.me/${SITE.whatsapp}`} target="_blank" rel="noopener noreferrer" className={`${card} transition-all hover:-translate-y-0.5 hover:shadow-bloom`}>
          <span className={iconBox}><MessageCircle size={22} /></span>
          <h2 className="font-display text-xl text-cocoa">WhatsApp</h2>
          <p className="text-sm">The fastest way to reach us. Send a message anytime.</p>
          <p className="text-sm font-bold text-berry">{SITE.phoneDisplay}</p>
        </a>

        <a href={`tel:${SITE.phoneTel}`} className={`${card} transition-all hover:-translate-y-0.5 hover:shadow-bloom`}>
          <span className={iconBox}><Phone size={22} /></span>
          <h2 className="font-display text-xl text-cocoa">Call us</h2>
          <p className="text-sm">Speak with our team during opening hours.</p>
          <p className="text-sm font-bold text-berry">{SITE.phoneDisplay}</p>
        </a>

        <a href={SITE.mapsUrl} target="_blank" rel="noopener noreferrer" className={`${card} transition-all hover:-translate-y-0.5 hover:shadow-bloom`}>
          <span className={iconBox}><MapPin size={22} /></span>
          <h2 className="font-display text-xl text-cocoa">Visit the atelier</h2>
          <p className="text-sm">{SITE.address}</p>
          <p className="text-sm font-bold text-berry">Open in Google Maps</p>
        </a>

        <div className={card}>
          <span className={iconBox}><Clock size={22} /></span>
          <h2 className="font-display text-xl text-cocoa">Opening hours</h2>
          <ul className="space-y-1 text-sm">
            {SITE.hours.map((h) => (
              <li key={h.days} className="flex justify-between gap-4">
                <span>{h.days}</span>
                <b className="text-cocoa">{h.time}</b>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="flex flex-col items-start justify-between gap-4 rounded-2xl bg-blush p-6 md:flex-row md:items-center">
        <div>
          <h2 className="font-display text-xl text-cocoa">Planning a special celebration?</h2>
          <p className="text-sm">Tell us about your custom cake and we will get back to you within 24 hours.</p>
        </div>
        <Link href="/custom-cakes" className="rounded-full bg-white px-6 py-2.5 text-sm font-semibold text-berry">
          Request a custom cake
        </Link>
      </div>
    </div>
  );
}