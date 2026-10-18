import { Suspense } from "react";
import OrdersView from "@/components/admin/OrdersView";

export default function AdminOrdersPage() {
  return (
    <Suspense fallback={<div className="h-96 animate-pulse rounded-2xl bg-sand" />}>
      <OrdersView />
    </Suspense>
  );
}