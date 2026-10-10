import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Products",
};

export default function ProductsPage() {
  return <h1 className="text-2xl font-bold text-brand">Products</h1>;
}
