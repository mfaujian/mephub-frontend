import type { Metadata } from "next";
import QuickOrderView from "@/components/QuickOrderView";

export const metadata: Metadata = {
  title: "Quick order",
};

export default function QuickOrderPage() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-brand">Quick order</h1>
        <p className="mt-1 text-sm text-slate-600">
          Know your part numbers? Paste a list from your BOQ or purchase request and add everything to the cart in one step.
        </p>
      </div>
      <QuickOrderView />
    </div>
  );
}