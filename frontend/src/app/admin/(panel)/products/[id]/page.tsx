import { Suspense } from "react";
import ProductEditView from "@/components/admin/ProductEditView";

export default function AdminProductEditPage() {
  return (
    <Suspense fallback={<div className="h-96 animate-pulse rounded-2xl bg-sand" />}>
      <ProductEditView />
    </Suspense>
  );
}