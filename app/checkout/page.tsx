import type { Metadata } from "next";
import CheckoutView from "@/components/CheckoutView";
import ProtectedRoute from "@/components/guards/ProtectedRoute";

export const metadata: Metadata = {
  title: "Checkout",
};

export default function CheckoutPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-brand">Checkout</h1>
      <ProtectedRoute>
        <CheckoutView />
      </ProtectedRoute>
    </div>
  );
}