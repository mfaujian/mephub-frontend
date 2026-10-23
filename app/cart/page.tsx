import type { Metadata } from "next";
import CartView from "@/components/CartView";

export const metadata: Metadata = {
  title: "Cart",
};

export default function CartPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-brand">Shopping cart</h1>
      <CartView />
    </div>
  );
}