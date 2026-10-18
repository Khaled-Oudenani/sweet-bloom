import { Suspense } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <Suspense fallback={<div className="h-16 border-b border-line bg-cream" />}>
        <Navbar />
      </Suspense>
      <main className="min-w-0 flex-1">{children}</main>
      <Footer />
      <CartDrawer />
    </div>
  );
}