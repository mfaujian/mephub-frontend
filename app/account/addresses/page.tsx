import type { Metadata } from "next";
import AddressesView from "@/components/AddressesView";
import ProtectedRoute from "@/components/guards/ProtectedRoute";

export const metadata: Metadata = {
  title: "My addresses",
};

export default function AddressesPage() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-brand">Delivery addresses</h1>
        <p className="mt-1 text-sm text-slate-600">Save your workshop and project sites once, pick one at checkout.</p>
      </div>
      <ProtectedRoute>
        <AddressesView />
      </ProtectedRoute>
    </div>
  );
}