import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Orders",
};

export default function OrdersPage() {
  return <h1 className="text-2xl font-bold text-brand">Orders</h1>;
}
