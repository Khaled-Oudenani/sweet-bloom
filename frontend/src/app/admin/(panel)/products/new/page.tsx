import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import ProductForm from "@/components/admin/ProductForm";

export default function NewProductPage() {
  return (
    <div className="space-y-5">
      <Link href="/admin/products" className="inline-flex items-center gap-1 text-sm font-semibold text-berry">
        <ArrowLeft size={16} /> Back to products
      </Link>
      <h1 className="font-display text-3xl font-semibold text-cocoa">New product</h1>
      <p className="text-sm text-cocoa-muted">Create the product first, then you can upload its images.</p>
      <div className="max-w-3xl"><ProductForm /></div>
    </div>
  );
}