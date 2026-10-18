import { Suspense } from "react";
import OrderDetailView from "@/components/admin/OrderDetailView";

export default function AdminOrderDetailPage() {
  return (
    <Suspense fallback={<div className="h-96 animate-pulse rounded-2xl bg-sand" />}>
      <OrderDetailView />
    </Suspense>
  );
}