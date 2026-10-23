import type { Metadata } from "next";
import ProductsManager from "@/components/ProductsManager";

export const metadata: Metadata = {
  title: "Dashboard: products",
};

export default function DashboardPage() {
  return (
    <>
      <div>
        <h1 className="text-2xl font-bold text-brand">Products</h1>
        <p className="mt-1 text-sm text-slate-600">Create, edit and remove catalog products for any supplier.</p>
      </div>
      <ProductsManager />
    </>
  );
}