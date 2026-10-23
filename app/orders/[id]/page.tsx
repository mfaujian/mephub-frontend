import type { Metadata } from "next";
import { Suspense } from "react";
import ProtectedRoute from "@/components/guards/ProtectedRoute";
import OrderDetailView from "@/components/OrderDetailView";

export const metadata: Metadata = {
  title: "Order details",
};

export default function OrderDetailPage() {
  return (
    <Suspense fallback={<div aria-busy="true" className="h-64 animate-pulse rounded-lg bg-slate-200" />}>
      <ProtectedRoute>
        <OrderDetailView />
      </ProtectedRoute>
    </Suspense>
  );
}