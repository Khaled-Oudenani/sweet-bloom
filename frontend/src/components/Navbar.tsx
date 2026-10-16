"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Flower2, Menu, ShoppingBag, X } from "lucide-react";
import { useCart } from "@/store/cart";

const links = [
  { href: "/", label: "Home" },
  { href: "/shop", label: "Shop" },
  { href: "/custom-cakes", label: "Custom Cakes" },
  { href: "/contact", label: "Contact" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const count = useCart((s) => s.items.reduce((n, i) => n + i.quantity, 0));
  const openCart = useCart((s) => s.openCart);

  useEffect(() => setMounted(true), []); // يمنع hydration mismatch للعدّاد

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <header className="sticky top-0 z-40 border-b border-line/60 bg-cream/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 md:px-12">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-blush text-berry">
            <Flower2 size={18} />
          </span>
          <span className="font-display text-xl font-semibold text-cocoa">
            Sweet Bloom
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                isActive(l.href)
                  ? "bg-berry text-white"
                  : "text-cocoa hover:bg-sand"
              }`}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <button
            onClick={openCart}
            aria-label="Open basket"
            className="relative flex h-10 w-10 items-center justify-center rounded-full text-cocoa transition-colors hover:bg-sand"
          >
            <ShoppingBag size={22} />
            {mounted && count > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-berry px-1 text-[11px] font-bold text-white">
                {count}
              </span>
            )}
          </button>

          <button
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Toggle menu"
            className="flex h-10 w-10 items-center justify-center rounded-full text-cocoa hover:bg-sand md:hidden"
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <nav className="border-t border-line bg-cream px-5 py-3 md:hidden">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setMenuOpen(false)}
              className={`block rounded-xl px-4 py-3 text-sm font-semibold ${
                isActive(l.href) ? "bg-blush text-berry" : "text-cocoa"
              }`}
            >
              {l.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}