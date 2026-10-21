import type { Metadata } from "next";
import ProtectedRoute from "@/components/guards/ProtectedRoute";
import MyOrdersView from "@/components/MyOrdersView";

export const metadata: Metadata = {
  title: "My orders",
};

export default function OrdersPage() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-brand">My orders</h1>
        <p className="mt-1 text-sm text-slate-600">Orders are split per supplier. Open an order to see its items, delivery and payment details.</p>
      </div>
      <ProtectedRoute>
        <MyOrdersView />
      </ProtectedRoute>
    </div>
  );
}