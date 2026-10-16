import type { Metadata } from "next";
import { Playfair_Display, DM_Sans } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";

const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair" });
const dmSans = DM_Sans({ subsets: ["latin"], variable: "--font-dm-sans" });

export const metadata: Metadata = {
  title: "Sweet Bloom — Artisan Confectionery, Laghouat",
  description: "Handcrafted cakes, macarons and pastries in Laghouat, Algeria.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${playfair.variable} ${dmSans.variable} antialiased flex min-h-screen flex-col`}>
       <Navbar />
       <main className="min-w-0 flex-1">{children}</main>
       <Footer />
       <CartDrawer />
      </body>
    </html>
  );
}