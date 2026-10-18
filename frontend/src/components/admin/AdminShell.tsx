"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Cake, Flower2, LayoutDashboard, LogOut, MapPin, Menu, MessageSquare,
  Package, ShoppingBag, Tags, Ticket, X,
} from "lucide-react";
import { clearToken, getMe, getToken, type AdminUser } from "@/lib/admin-api";

const NAV = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/orders", label: "Orders", icon: ShoppingBag },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/categories", label: "Categories", icon: Tags },
  { href: "/admin/reviews", label: "Reviews", icon: MessageSquare },
  { href: "/admin/custom-requests", label: "Custom cakes", icon: Cake },
  { href: "/admin/coupons", label: "Coupons", icon: Ticket },
  { href: "/admin/delivery-zones", label: "Delivery zones", icon: MapPin },
];

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!getToken()) {
      router.replace("/admin/login");
      return;
    }
    getMe().then(setAdmin).catch(() => {});
  }, [router]);

  function logout() {
    clearToken();
    router.replace("/admin/login");
  }

  const isActive = (href: string) => (href === "/admin" ? pathname === "/admin" : pathname.startsWith(href));

  if (!admin) {
    return <div className="flex min-h-screen items-center justify-center text-sm text-cocoa-muted">Loading...</div>;
  }

  const sidebar = (
    <nav className="flex h-full flex-col gap-1 p-4">
      <div className="mb-4 flex items-center gap-2 px-2">
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-blush text-berry"><Flower2 size={18} /></span>
        <span className="font-display text-lg font-semibold text-cocoa">Sweet Bloom</span>
      </div>
      {NAV.map(({ href, label, icon: Icon }) => (
        <Link
          key={href}
          href={href}
          onClick={() => setOpen(false)}
          className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors ${
            isActive(href) ? "bg-berry text-white" : "text-cocoa hover:bg-sand"
          }`}
        >
          <Icon size={18} /> {label}
        </Link>
      ))}
      <div className="mt-auto space-y-2 border-t border-line pt-4">
        <p className="truncate px-2 text-xs text-cocoa-muted">{admin.email}</p>
        <Link href="/" target="_blank" className="block px-2 text-xs font-semibold text-berry">View website</Link>
        <button onClick={logout} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-danger hover:bg-danger/10">
          <LogOut size={18} /> Sign out
        </button>
      </div>
    </nav>
  );

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[240px_1fr]">
      <aside className="sticky top-0 hidden h-screen border-r border-line bg-white lg:block">{sidebar}</aside>

      <div className="flex items-center justify-between border-b border-line bg-white px-4 py-3 lg:hidden">
        <span className="font-display text-lg font-semibold text-cocoa">Sweet Bloom Admin</span>
        <button onClick={() => setOpen(true)} aria-label="Open menu"><Menu size={24} /></button>
      </div>
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-cocoa/40" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-0 h-full w-64 bg-white shadow-warm">
            <button onClick={() => setOpen(false)} aria-label="Close menu" className="absolute right-3 top-3"><X size={20} /></button>
            {sidebar}
          </div>
        </div>
      )}

      <main className="min-w-0 p-4 md:p-8">{children}</main>
    </div>
  );
}